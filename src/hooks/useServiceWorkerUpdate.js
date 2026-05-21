import { useEffect, useState } from 'react';

/**
 * Hook para detectar actualizaciones del Service Worker.
 *
 * ESTRATEGIA DE EVENTO EN VIVO:
 * autoReload está DESHABILITADO por defecto durante el evento.
 * Razón: si el admin hace un hotfix y sube un deploy a mitad de la noche,
 * un reload automático interrumpe a los invitados que están votando
 * o subiendo fotos, perdiendo su estado de interacción.
 *
 * El flag `hasUpdate` permite mostrar un banner "Hay una versión nueva"
 * para que el usuario decida cuándo recargar voluntariamente.
 */
export const useServiceWorkerUpdate = (options = {}) => {
    const { autoReload = false, reloadDelay = 3000 } = options;
    const [hasUpdate, setHasUpdate] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleControllerChange = () => {
            setHasUpdate(true);
            if (autoReload) {
                setTimeout(() => window.location.reload(), reloadDelay);
            }
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    }, [autoReload, reloadDelay]);

    return { hasUpdate, applyUpdate: () => window.location.reload() };
};

export default useServiceWorkerUpdate;
