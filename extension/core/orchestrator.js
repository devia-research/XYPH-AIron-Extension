/**
 * AgentOrchestrator — Multi-provider fallback orchestration for AIron.
 *
 * Provides:
 *  - fetchWithTimeout   : wraps fetch() with an AbortController deadline
 *  - callProvider       : calls a single AI provider with exponential-backoff retry
 *  - runWithFallback    : tries providers in order, returning the first success
 *  - healthCheck        : lightweight reachability probe with 1-minute result cache
 *
 * Works both as a service-worker importScripts() module and as a <script> tag.
 */
class AgentOrchestrator {
    constructor() {
        /** Default per-request timeout (ms). */
        this.DEFAULT_TIMEOUT_MS = 30000;
        /** Maximum retry attempts for transient errors (429 / 503 / network). */
        this.MAX_RETRIES = 2;
        /** Base delay for exponential backoff (ms). Doubles on each retry. */
        this.RETRY_BASE_DELAY_MS = 1000;
        /** Timeout used for lightweight provider health-check probes (ms). */
        this.HEALTH_CHECK_TIMEOUT_MS = 8000;

        /** OpenAI-compatible chat-completion endpoints keyed by provider name. */
        this.providerEndpoints = {
            deepseek: 'https://api.deepseek.com/chat/completions',
            openai:   'https://api.openai.com/v1/chat/completions',
            anthropic:'https://api.anthropic.com/v1/messages',
            groq:     'https://api.groq.com/openai/v1/chat/completions',
            ollama:   'http://localhost:11434/v1/chat/completions'
        };

        /** Default model to use when none is specified per provider. */
        this.providerDefaultModels = {
            deepseek: 'deepseek-chat',
            openai:   'gpt-3.5-turbo',
            anthropic:'claude-3-haiku-20240307',
            groq:     'llama-3.3-70b-versatile',
            ollama:   'llama3.2'
        };

        /** In-memory health cache: providerKey → { ts, healthy } */
        this._healthCache = new Map();
        /** Cache TTL in ms (1 minute). */
        this._healthCacheTTLMs = 60000;
    }

    // -------------------------------------------------------------------------
    // Core primitives
    // -------------------------------------------------------------------------

    /**
     * Wraps fetch() with an AbortController deadline so callers never hang.
     * @param {string}  url
     * @param {Object}  options   — standard fetch init options
     * @param {number}  timeoutMs — abort after this many ms (default 30 s)
     * @returns {Promise<Response>}
     */
    async fetchWithTimeout(url, options = {}, timeoutMs = this.DEFAULT_TIMEOUT_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Calls one AI provider with up to MAX_RETRIES retries for transient errors.
     *
     * Retryable conditions:
     *  • HTTP 429 (rate-limited)
     *  • HTTP 503 (service unavailable)
     *  • AbortError (timeout)
     *  • TypeError (network failure)
     *
     * @param {string}  providerName  — key in providerEndpoints
     * @param {string}  apiKey
     * @param {string}  [model]       — overrides providerDefaultModels when set
     * @param {Array}   messages      — chat message array [{role, content}, …]
     * @param {number}  [maxTokens=2000]
     * @param {number}  [temperature=0.7]
     * @returns {Promise<string>} text content of the first choice
     */
    async callProvider(providerName, apiKey, model, messages, maxTokens = 2000, temperature = 0.7) {
        const endpoint = this.providerEndpoints[providerName];
        if (!endpoint) {
            throw new Error(`[Orchestrator] Provider inconnu: ${providerName}`);
        }

        const resolvedModel = model || this.providerDefaultModels[providerName] || '';
        let lastError;

        for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delay = this.RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                console.warn(`[Orchestrator] Retry ${attempt}/${this.MAX_RETRIES} for ${providerName}`);
            }

            try {
                const response = await this.fetchWithTimeout(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: resolvedModel,
                        messages,
                        max_tokens: maxTokens,
                        temperature
                    })
                });

                if (!response.ok) {
                    const retryable = response.status === 429 || response.status === 503;
                    const msg = `HTTP ${response.status} from ${providerName}`;
                    if (retryable && attempt < this.MAX_RETRIES) {
                        lastError = new Error(msg);
                        continue;
                    }
                    throw new Error(msg);
                }

                const data = await response.json();
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error(`[Orchestrator] Format de réponse invalide de ${providerName}`);
                }
                return data.choices[0].message.content;

            } catch (err) {
                const retryable = err.name === 'AbortError' || err.name === 'TypeError';
                if (retryable && attempt < this.MAX_RETRIES) {
                    lastError = err;
                    continue;
                }
                throw err;
            }
        }

        throw lastError;
    }

    // -------------------------------------------------------------------------
    // Orchestration
    // -------------------------------------------------------------------------

    /**
     * Tries providers in order, returning the first successful AI response.
     * Designed for multi-agent / orchestration scenarios where resilience
     * across provider failures is required.
     *
     * @param {string} prompt
     * @param {Array<{provider: string, apiKey: string, model?: string}>} providerChain
     * @param {Object} [options]
     * @param {string}  [options.systemContext]  — prepended system message
     * @param {number}  [options.maxTokens=2000]
     * @param {number}  [options.temperature=0.7]
     * @returns {Promise<{result: string, usedProvider: string}>}
     */
    async runWithFallback(prompt, providerChain, options = {}) {
        const { systemContext = null, maxTokens = 2000, temperature = 0.7 } = options;

        const messages = [];
        if (systemContext) {
            messages.push({ role: 'system', content: systemContext });
        }
        messages.push({ role: 'user', content: prompt });

        const errors = [];
        for (const { provider, apiKey, model } of providerChain) {
            if (!apiKey) {
                errors.push(`${provider}: clé API manquante`);
                continue;
            }
            try {
                const result = await this.callProvider(provider, apiKey, model, messages, maxTokens, temperature);
                return { result, usedProvider: provider };
            } catch (err) {
                const errMsg = `${provider}: ${err.message}`;
                errors.push(errMsg);
                console.warn(`[Orchestrator] ${errMsg} — passage au provider suivant`);
            }
        }

        throw new Error(`[Orchestrator] Tous les providers ont échoué:\n${errors.join('\n')}`);
    }

    // -------------------------------------------------------------------------
    // Health checking
    // -------------------------------------------------------------------------

    /**
     * Probes a provider with a minimal request to verify reachability.
     * Results are cached for healthCacheTTLMs (default 1 min) to avoid
     * excessive traffic when called repeatedly.
     *
     * @param {string} providerName
     * @param {string} apiKey
     * @returns {Promise<boolean>} true if provider responded (even with an auth/param error)
     */
    async healthCheck(providerName, apiKey) {
        const cacheKey = `${providerName}:${(apiKey || '').slice(0, 8)}`;
        const cached = this._healthCache.get(cacheKey);
        if (cached && (Date.now() - cached.ts) < this._healthCacheTTLMs) {
            return cached.healthy;
        }

        if (!apiKey || !this.providerEndpoints[providerName]) {
            return false;
        }

        let healthy = false;
        try {
            const response = await this.fetchWithTimeout(
                this.providerEndpoints[providerName],
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.providerDefaultModels[providerName] || '',
                        messages: [{ role: 'user', content: 'ping' }],
                        max_tokens: 1
                    })
                },
                this.HEALTH_CHECK_TIMEOUT_MS
            );
            // 400/422 means we reached the server (auth or param issue, but it's up)
            healthy = response.ok || response.status === 400 || response.status === 422;
        } catch {
            healthy = false;
        }

        this._healthCache.set(cacheKey, { ts: Date.now(), healthy });
        return healthy;
    }
}

// ── Exports ──────────────────────────────────────────────────────────────────
// Service-worker context (importScripts) and browser page (<script src>)
if (typeof globalThis !== 'undefined') {
    globalThis.AgentOrchestrator = AgentOrchestrator;
}
// Node.js / CommonJS (unit tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentOrchestrator;
}
