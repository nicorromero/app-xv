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
                // clientsClaim: true  ← REMOVIDO intencionalmente.
                // Con clientsClaim activo, un nuevo SW toma control de todos los
                // tabs inmediatamente. Si 500 usuarios están usando la app y se
                // hace un deploy, sus chunks de JS en vuelo quedan invalidados
                // causando ChunkLoadError masivos. El SW nuevo espera a que los
                // usuarios naveguen naturalmente antes de tomar control.
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
                    // 5. Cloudinary: CacheFirst (fotos de evento son inmutables).
                    // StaleWhileRevalidate genera una red extra por imagen; con 500 usuarios
                    // x 200 imágenes = 100K solicitudes gratuitas desperdiciadas.
                    {
                        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cloudinary-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ],
                // Precarga todos los assets del build para offline
                // Pre-caching explícito de las 19 fotos del Book (estáticas en /public).
                // El SW las descarga en la instalación inicial, antes de que el usuario
                // haga scroll. Con 500 usuarios, esto evita 500 peticiones concurrentes
                // a la misma red 4G del salón ya que el archivo sirve desde caché local.
                additionalManifestEntries: [
                    ...Array.from({ length: 19 }, (_, i) => ({
                        url: `/images/book/book${i + 1}.jpeg`,
                        revision: '2026-fiesta-v1',
                    })),
                ],
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
                    // React core: crítico, siempre en el bundle inicial
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                        return 'vendor-react';
                    }
                    // React Router: crítico para renderizar cualquier ruta
                    if (id.includes('node_modules/react-router')) {
                        return 'vendor-react';
                    }

                    // Firebase Auth: necesario en la pantalla de login (cold start)
                    // Se separa de Firestore para que el invitado descargue solo Auth primero
                    if (
                        id.includes('node_modules/firebase/auth') ||
                        id.includes('node_modules/@firebase/auth')
                    ) {
                        return 'vendor-firebase-auth';
                    }

                    // Firebase Firestore: se descarga después del login (lazy en db.js)
                    if (
                        id.includes('node_modules/firebase/firestore') ||
                        id.includes('node_modules/@firebase/firestore')
                    ) {
                        return 'vendor-firebase-firestore';
                    }

                    // Firebase Performance + Analytics: menor prioridad, post-login
                    if (
                        id.includes('node_modules/firebase/performance') ||
                        id.includes('node_modules/@firebase/performance') ||
                        id.includes('node_modules/firebase/analytics') ||
                        id.includes('node_modules/@firebase/app')
                    ) {
                        return 'vendor-firebase-core';
                    }

                    // Lucide: tree-shaking lo reduce, pero sigue siendo lazy por si acaso
                    if (id.includes('node_modules/lucide')) {
                        return 'vendor-icons';
                    }

                    // Framer Motion: solo necesario en vistas con animaciones
                    if (id.includes('node_modules/framer-motion')) {
                        return 'vendor-framer';
                    }

                    // Browser Image Compression: solo en galería
                    if (id.includes('node_modules/browser-image-compression')) {
                        return 'vendor-img-compress';
                    }

                    // Resto de node_modules
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
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
    }
})