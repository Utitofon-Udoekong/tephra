// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-security',
    '@nuxt/icon',
    'nuxt-charts',
    '@pinia/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Tephra - On-Chain Analytics for Babylon Genesis',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Production-ready on-chain analytics solution for the Babylon Genesis blockchain. Track addresses, portfolios, smart money, and on-chain metrics.' },
        { name: 'theme-color', content: '#0f172a' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  runtimeConfig: {
    // Private keys (server-only)
    authSecret: process.env.NUXT_AUTH_SECRET || 'tephra-dev-secret',
    babylonRpcUrl: process.env.NUXT_BABYLON_RPC_URL || 'https://babylon-testnet-rpc.polkachu.com',
    babylonLcdUrl: process.env.NUXT_BABYLON_LCD_URL || 'https://babylon-testnet-api.polkachu.com',
    // Public keys (exposed to client)
    public: {
      appName: 'Tephra',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      babylonChainId: process.env.NUXT_BABYLON_CHAIN_ID || 'bbn-test-6',
    },
  },

  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
    },
  },
})