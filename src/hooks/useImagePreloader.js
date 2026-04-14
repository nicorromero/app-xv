import { useEffect, useCallback, useRef } from 'react';

// Hook para precargar imágenes críticas
export const useImagePreloader = () => {
    const loadedImages = useRef(new Set());

    const preloadImage = useCallback((url) => {
        if (!url || loadedImages.current.has(url)) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                loadedImages.current.add(url);
                resolve(url);
            };
            img.onerror = reject;
            img.src = url;
        });
    }, []);

    const preloadBatch = useCallback(async (urls, batchSize = 3) => {
        const toLoad = urls.filter(url => !loadedImages.current.has(url));
        
        for (let i = 0; i < toLoad.length; i += batchSize) {
            const batch = toLoad.slice(i, i + batchSize);
            await Promise.allSettled(batch.map(preloadImage));
            // Pequeña pausa entre batches para no saturar
            if (i + batchSize < toLoad.length) {
                await new Promise(r => setTimeout(r, 100));
            }
        }
    }, [preloadImage]);

    return { preloadImage, preloadBatch, isLoaded: (url) => loadedImages.current.has(url) };
};

// Hook para lazy loading de imágenes con IntersectionObserver
export const useLazyImage = (src, options = {}) => {
    const { rootMargin = '50px', threshold = 0.01 } = options;
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const element = imgRef.current;
        if (!element || shouldLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin, threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [shouldLoad, rootMargin, threshold]);

    useEffect(() => {
        if (!shouldLoad || !src) return;

        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.src = src;
    }, [shouldLoad, src]);

    return { imgRef, shouldLoad, isLoaded, src: shouldLoad ? src : null };
};

import { useState } from 'react';
