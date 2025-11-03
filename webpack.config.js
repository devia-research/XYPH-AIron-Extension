const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'cheap-module-source-map',
    
    entry: {
      background: './src/background/index.ts',
      content: './src/content/index.ts',
      inject: './src/inject/index.ts',
      popup: './src/popup/index.tsx',
      sidepanel: './src/sidepanel/index.tsx',
      options: './src/options/index.tsx',
      offscreen: './src/offscreen/index.ts'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { chrome: '112' } }],
                '@babel/preset-typescript',
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        },
        {
          test: /\.wasm$/,
          type: 'asset/resource',
          generator: {
            filename: 'wasm/[name][ext]'
          }
        }
      ]
    },
    
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@assets': path.resolve(__dirname, 'src/assets')
      }
    },
    
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            to: 'manifest.json'
          },
          {
            from: 'src/static',
            to: '.',
            noErrorOnMissing: true
          },
          {
            from: 'src/assets',
            to: 'assets',
            noErrorOnMissing: true
          },
          {
            from: 'src/_locales',
            to: '_locales',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            }
          }
        })
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    
    performance: {
      maxAssetSize: 5000000,
      maxEntrypointSize: 5000000
    }
  };
};