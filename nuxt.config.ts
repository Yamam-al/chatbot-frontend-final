// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-10-14',
  typescript: { strict: true },
  css: [],

  runtimeConfig: {
    public: {
      // Passe das an deinen Backend-Port/Host an:
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'
    }
  },

  build: { transpile: ['naive-ui', 'vueuc', '@css-render/vue3-ssr'] },
  vite: {
    ssr: { noExternal: ['naive-ui', 'vueuc', '@css-render/vue3-ssr'] },
    optimizeDeps: { include: ['naive-ui', 'vueuc', '@css-render/vue3-ssr'] }
  }
})
