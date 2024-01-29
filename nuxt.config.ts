// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
      css: {
          preprocessorOptions: {
              scss: {
                  additionalData: '@use "@/assets/style.scss" as *;'
              }
          }
      }
  },
  
  nitro: {
    preset: 'node-server'
  },
  imports: {
    dirs: [
        'composables/**'
    ]
  }
})
