import { createPinia } from 'pinia'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
nuxtApp.vueApp.use(createPinia())
})