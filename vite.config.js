import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
    plugins: [
        react(),
        ViteImageOptimizer({
            jpg: { quality: 80 },
            jpeg: { quality: 80 },
            png: { quality: 80 },
            webp: { lossless: false, quality: 80 }
        }),
        VitePWA({
            injectRegister: 'inline',
            registerType: 'autoUpdate',
            workbox: {
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
                runtimeCaching: [
                    // 1. Navegación y HTML - siempre buscar versión nueva primero
                    {
                        urlPattern: ({ request }) => request.mode === 'navigate',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'nav-cache',
                            networkTimeoutSeconds: 3,
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // 2. Assets de la app (JS, CSS) - siempre actualizar primero
                    {
                        urlPattern: ({ url }) => url.pathname.match(/\.(?:js|css)$/i),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'app-assets-cache',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // 3. Firebase API
                    {
                        urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'firebase-api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24
                            },
                            networkTimeoutSeconds: 3
                        }
                    },
                    // 4. Imágenes locales - cache primero para rendimiento
                    {
                        urlPattern: ({ url }) => url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp)$/i) && !url.hostname.includes('cloudinary'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7
                            }
                        }
                    },
                    // 5. Cloudinary
                    {
                        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'cloudinary-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30
                            }
                        }
                    }
                ],
                // Siempre buscar actualizaciones del SW inmediatamente
                // y activar la nueva versión sin esperar
                clientsClaim: true,
                skipWaiting: true
                // Precarga todos los assets del build para offline
            },
            manifest: {
                name: 'Mis 15 - App Oficial',
                short_name: 'Mis 15',
                description: 'App para votar, pedir música y subir fotos',
                theme_color: '#e0218a',
                background_color: '#0f0f0f',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
                        return 'vendor-firebase';
                    }
                    if (id.includes('node_modules/lucide')) {
                        return 'vendor-icons';
                    }
                    if (id.includes('node_modules/browser-image-compression')) {
                        return 'vendor-img-compress';
                    }
                    if (id.includes('node_modules/framer-motion')) {
                        return 'vendor-framer';
                    }
                    if (id.includes('node_modules')) {
                        return 'vendor-misc';
                    }
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        cssMinify: true,
        sourcemap: false
    }
})