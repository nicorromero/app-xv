import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            injectRegister: 'inline',
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
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Chunk 1: React y su ecosistema (cambia muy poco, se cachea mucho)
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    // Chunk 2: Firebase Core (Auth, Firestore, Storage juntos)
                    if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
                        return 'vendor-firebase';
                    }
                    // Chunk 3: El resto de node_modules (cloudinary-upload, etc.)
                    if (id.includes('node_modules')) {
                        return 'vendor-misc';
                    }
                }
            }
        }
    }
})