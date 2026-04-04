import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            injectRegister: 'inline', // <--- Esto destraba el error que te dio antes
            registerType: 'autoUpdate',
            manifest: {
                name: 'Mis 15 - App Oficial',
                short_name: 'Mis 15',
                description: 'App para votar, pedir música y subir fotos',
                theme_color: '#e0218a',
                background_color: '#0f0f0f',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ]
})