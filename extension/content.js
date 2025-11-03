// Content script for AI Script Commander
class ContentScript {
    constructor() {
        this.setupMessageListener();
        this.injectAutoFillCapabilities();
        this.setupWebScraping();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'autoFillForm':
                    const result = await this.autoFillForm(request.dataType, request.fields);
                    sendResponse(result);
                    break;
                    
                case 'webScraping':
                    const scrapingResult = await this.performScraping(request.url, request.type, request.filter);
                    sendResponse(scrapingResult);
                    break;
                    
                case 'detectForms':
                    const forms = this.detectForms();
                    sendResponse({ forms });
                    break;
                    
                default:
                    sendResponse({ error: 'Action non supportée' });
            }
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async autoFillForm(dataType = 'french', fields = ['username', 'email', 'password', 'personal']) {
        const formFiller = new FormAutoFiller(dataType, fields);
        const filledFields = formFiller.fillAllDetectedFields();
        
        return {
            success: filledFields.length > 0,
            filledFields: filledFields,
            dataType: dataType,
            timestamp: new Date().toISOString()
        };
    }

    detectForms() {
        const forms = Array.from(document.forms);
        return forms.map((form, index) => ({
            id: form.id || `form-${index}`,
            action: form.action,
            method: form.method,
            fields: Array.from(form.elements)
                .filter(el => el.tagName !== 'BUTTON')
                .map(el => ({
                    name: el.name,
                    type: el.type,
                    id: el.id,
                    placeholder: el.placeholder,
                    tagName: el.tagName
                }))
        }));
    }

    async performScraping(url, type, filter) {
        // Implémentation réelle du scraping
        const results = await this.scrapeContent(type, filter);
        return { results };
    }

    async scrapeContent(type, filter) {
        switch (type) {
            case 'scripts':
                return this.scrapeScripts(filter);
            case 'links':
                return this.scrapeLinks(filter);
            case 'texts':
                return this.scrapeTexts(filter);
            case 'images':
                return this.scrapeImages(filter);
            case 'tables':
                return this.scrapeTables(filter);
            default:
                return this.scrapeScripts(filter);
        }
    }

    scrapeScripts(filter) {
        const scripts = Array.from(document.scripts);
        return scripts
            .map(script => script.src || script.innerHTML.substring(0, 100))
            .filter(src => !filter || src.includes(filter))
            .slice(0, 50);
    }

    scrapeLinks(filter) {
        const links = Array.from(document.links);
        return links
            .map(link => link.href)
            .filter(href => !filter || href.includes(filter))
            .slice(0, 50);
    }

    scrapeTexts(filter) {
        const texts = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div'))
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 10);
        
        return filter ? texts.filter(text => text.includes(filter)) : texts.slice(0, 50);
    }

    scrapeImages(filter) {
        const images = Array.from(document.images);
        return images
            .map(img => img.src)
            .filter(src => !filter || src.includes(filter))
            .slice(0, 50);
    }

    scrapeTables(filter) {
        const tables = Array.from(document.querySelectorAll('table'));
        return tables
            .map(table => {
                const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
                return `Table with headers: ${headers.join(', ')}`;
            })
            .filter(desc => !filter || desc.includes(filter))
            .slice(0, 20);
    }

    injectAutoFillCapabilities() {
        // Injecter les styles et utilitaires d'auto-remplissage
        const style = document.createElement('style');
        style.textContent = `
            .ai-script-commander-highlight {
                border: 2px solid #2563eb !important;
                background: rgba(37, 99, 235, 0.1) !important;
            }
            
            .ai-script-commander-tooltip {
                position: fixed;
                background: #1e293b;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    setupWebScraping() {
        // Ajouter des écouteurs pour détecter les changements de page
        this.observePageChanges();
    }

    observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    this.handleNewContent(mutation.addedNodes);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    handleNewContent(nodes) {
        // Analyser le nouveau contenu pour détecter les opportunités de scraping
        nodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
                this.analyzeNewElement(node);
            }
        });
    }

    analyzeNewElement(element) {
        // Détecter automatiquement les formulaires, scripts, etc.
        if (element.tagName === 'FORM') {
            console.log('🆕 Nouveau formulaire détecté:', element);
        }
        
        if (element.tagName === 'SCRIPT' && element.src) {
            console.log('🆕 Nouveau script détecté:', element.src);
        }
    }
}

class FormAutoFiller {
    constructor(dataType = 'french', fields = []) {
        this.dataType = dataType;
        this.fields = fields;
        this.userData = this.generateUserData();
    }

    generateUserData() {
        const dataGenerators = {
            'french': this.generateFrenchData.bind(this),
            'international': this.generateInternationalData.bind(this),
            'custom': this.generateCustomData.bind(this)
        };
        
        return dataGenerators[this.dataType]();
    }

    generateFrenchData() {
        const frenchFirstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Michel', 'Nathalie', 'David', 'Sarah', 'Thomas', 'Laura'];
        const frenchLastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Leroy', 'Moreau'];
        
        const firstName = frenchFirstNames[Math.floor(Math.random() * frenchFirstNames.length)];
        const lastName = frenchLastNames[Math.floor(Math.random() * frenchLastNames.length)];
        
        const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
        const domainsFr = ['orange.fr', 'free.fr', 'sfr.fr', 'bbox.fr'];
        const allDomains = [...domains, ...domainsFr];
        const domain = allDomains[Math.floor(Math.random() * allDomains.length)];
        
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return {
            username: username,
            email: `${username}@${domain}`,
            password: this.generateStrongPassword(),
            firstName: firstName,
            lastName: lastName,
            phone: this.generateFrenchPhoneNumber(),
            birthDate: this.generateBirthDate(),
            address: this.generateFrenchAddress()
        };
    }

    generateInternationalData() {
        const firstNames = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Maria'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
        
        return {
            username: username,
            email: `${username}@${domain}`,
            password: this.generateStrongPassword(),
            firstName: firstName,
            lastName: lastName,
            phone: this.generateInternationalPhoneNumber(),
            birthDate: this.generateBirthDate(),
            address: this.generateInternationalAddress()
        };
    }

    generateCustomData() {
        // Données personnalisables
        return this.generateFrenchData(); // Par défaut
    }

    generateStrongPassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        for (let i = 4; i < 12; i++) {
            const allChars = lowercase + uppercase + numbers + symbols;
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    generateFrenchPhoneNumber() {
        const prefixes = ['06', '07'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        let number = prefix;
        for (let i = 0; i < 8; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    }

    generateInternationalPhoneNumber() {
        const prefixes = ['+1', '+44', '+49', '+33', '+61'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        let number = prefix;
        for (let i = 0; i < 10; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    }

    generateBirthDate() {
        const year = 1980 + Math.floor(Math.random() * 25);
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    generateFrenchAddress() {
        const streets = ['Rue de la Paix', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain', 'Rue du Faubourg Saint-Honoré'];
        const cities = [
            { name: 'Paris', zip: '75000' },
            { name: 'Lyon', zip: '69000' },
            { name: 'Marseille', zip: '13000' },
            { name: 'Toulouse', zip: '31000' }
        ];
        
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        return {
            street: `${Math.floor(Math.random() * 100) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
            city: city.name,
            zipCode: city.zip,
            country: 'France'
        };
    }

    generateInternationalAddress() {
        const streets = ['Main Street', 'Park Avenue', 'Oak Road', 'Maple Drive'];
        const cities = [
            { name: 'New York', zip: '10001', country: 'USA' },
            { name: 'London', zip: 'SW1A 1AA', country: 'UK' },
            { name: 'Berlin', zip: '10115', country: 'Germany' },
            { name: 'Sydney', zip: '2000', country: 'Australia' }
        ];
        
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        return {
            street: `${Math.floor(Math.random() * 100) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
            city: city.name,
            zipCode: city.zip,
            country: city.country
        };
    }

    fillAllDetectedFields() {
        const filledFields = [];
        
        const fieldMappings = {
            'username': this.userData.username,
            'email': this.userData.email,
            'password': this.userData.password,
            'firstname': this.userData.firstName,
            'lastname': this.userData.lastName,
            'phone': this.userData.phone,
            'birthdate': this.userData.birthDate,
            'address': this.userData.address.street,
            'city': this.userData.address.city,
            'zipcode': this.userData.address.zipCode,
            'country': this.userData.address.country
        };

        Object.entries(fieldMappings).forEach(([fieldName, value]) => {
            if (this.fields.includes(fieldName) || this.fields.includes('personal')) {
                if (this.fillFieldByName(fieldName, value)) {
                    filledFields.push(fieldName);
                }
            }
        });

        this.checkAgreementBoxes();
        
        this.showSuccessNotification(`✅ ${filledFields.length} champs remplis automatiquement`);
        
        return filledFields;
    }

    fillFieldByName(fieldName, value) {
        const patterns = [
            `input[name*="${fieldName}" i]`,
            `input[id*="${fieldName}" i]`,
            `input[placeholder*="${fieldName}" i]`,
            `textarea[name*="${fieldName}" i]`,
            `textarea[id*="${fieldName}" i]`,
            `#${fieldName}`,
            `[name="${fieldName}"]`,
            `input[type="email"]`,
            `input[type="tel"]`,
            `input[type="password"]`
        ];

        for (const pattern of patterns) {
            const elements = document.querySelectorAll(pattern);
            for (const element of elements) {
                if (this.isFillableElement(element)) {
                    element.value = value;
                    this.triggerEvents(element);
                    return true;
                }
            }
        }
        return false;
    }

    isFillableElement(element) {
        return element.type !== 'hidden' && 
               !element.disabled && 
               element.offsetParent !== null &&
               element.style.display !== 'none' &&
               element.style.visibility !== 'hidden';
    }

    checkAgreementBoxes() {
        const agreementSelectors = [
            'input[type="checkbox"][name*="terms"]',
            'input[type="checkbox"][name*="conditions"]',
            'input[type="checkbox"][id*="accept"]',
            'input[type="checkbox"][name*="agree"]'
        ];

        agreementSelectors.forEach(selector => {
            const checkboxes = document.querySelectorAll(selector);
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked && this.isFillableElement(checkbox)) {
                    checkbox.click();
                    this.triggerEvents(checkbox);
                }
            });
        });
    }

    triggerEvents(element) {
        const events = ['input', 'change', 'blur', 'keydown', 'keyup', 'focus'];
        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
    }

    showSuccessNotification(message) {
        this.showNotification(message, '#10b981');
    }

    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Injecter les styles d'animation
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animationStyle);

// Initialisation
const contentScript = new ContentScript();