import { useEffect, useState } from 'react';

/**
 * Hook para detectar y aplicar actualizaciones del Service Worker.
 * Cuando hay una nueva versión de la app, recarga automáticamente
 * o muestra un prompt según la configuración.
 */
export const useServiceWorkerUpdate = (options = {}) => {
    const { autoReload = true, reloadDelay = 0 } = options;
    const [hasUpdate, setHasUpdate] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Cuando workbox con autoUpdate activa el nuevo SW, lanza controllerchange
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] Nueva versión detectada y activada, recargando...');
                setHasUpdate(true);
                if (autoReload) {
                    setTimeout(() => {
                        window.location.reload();
                    }, reloadDelay);
                }
            });
        }
    }, [autoReload, reloadDelay]);

    return { hasUpdate, applyUpdate: () => window.location.reload() };
};

export default useServiceWorkerUpdate;
