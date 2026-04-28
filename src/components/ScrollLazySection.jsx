import React, { useState, useEffect, useRef } from 'react';

/**
 * ScrollLazySection
 * Un componente envolvedor que difiere el montaje de sus hijos (children) 
 * hasta que el contenedor entra en el área visible (viewport) del navegador.
 * Ideal para evitar que componentes React.lazy descarguen sus chunks inmediatamente.
 */
const ScrollLazySection = ({ children, minHeight = '300px', rootMargin = '200px' }) => {
    const [hasEntered, setHasEntered] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (hasEntered) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasEntered(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [hasEntered, rootMargin]);

    return (
        <div ref={containerRef} style={!hasEntered ? { minHeight } : {}}>
            {hasEntered ? children : null}
        </div>
    );
};

export default ScrollLazySection;
