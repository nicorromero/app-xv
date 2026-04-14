import { useEffect, useState } from 'react';

/**
 * Hook para detectar y aplicar actualizaciones del Service Worker.
 * Cuando hay una nueva versión de la app, recarga automáticamente
 * o muestra un prompt según la configuración.
 */
export const useServiceWorkerUpdate = (options = {}) => {
    const { autoReload = true, reloadDelay = 2000 } = options;
    const [hasUpdate, setHasUpdate] = useState(false);
    const [waitingSW, setWaitingSW] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Escuchar cuando hay un nuevo service worker esperando
            const handleUpdate = (registration) => {
                const waitingServiceWorker = registration.waiting;
                if (waitingServiceWorker) {
                    setHasUpdate(true);
                    setWaitingSW(waitingServiceWorker);
                    
                    // Agregar listener para cuando el nuevo SW se active
                    waitingServiceWorker.addEventListener('statechange', (event) => {
                        if (event.target.state === 'activated') {
                            // Recargar página para usar nueva versión
                            if (autoReload) {
                                setTimeout(() => {
                                    window.location.reload();
                                }, reloadDelay);
                            }
                        }
                    });

                    // Forzar skipWaiting para activar inmediatamente
                    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
                }
            };

            // Registrar listener para updates
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] New controller, reloading...');
            });

            // Chequear si ya hay un SW waiting al montar
            navigator.serviceWorker.ready.then((registration) => {
                if (registration.waiting) {
                    handleUpdate(registration);
                }
                
                // Escuchar updates futuros
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Hay una nueva versión lista
                                handleUpdate(registration);
                            }
                        });
                    }
                });
            });
        }
    }, [autoReload, reloadDelay]);

    // Función manual para aplicar update
    const applyUpdate = () => {
        if (waitingSW) {
            waitingSW.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    return { hasUpdate, applyUpdate };
};

export default useServiceWorkerUpdate;
