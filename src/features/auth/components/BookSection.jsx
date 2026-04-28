import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

import { bookUno } from './bookData';

const BookSection = ({ 
    fotos = bookUno 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const sliderRef = useRef(null);
    const containerRef = useRef(null);

    // Intersection Observer para Lazy Loading en Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const minSwipeDistance = 50;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % fotos.length);
        setIsLoaded(false);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
        setIsLoaded(false);
    };

    // Swipe handlers para móvil
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) nextSlide();
        if (isRightSwipe) prevSlide();
    };

    // Precargar siguiente imagen (solo si es visible)
    useEffect(() => {
        if (!isVisible) return;
        const nextIndex = (currentIndex + 1) % fotos.length;
        const img = new Image();
        img.src = fotos[nextIndex].src;
    }, [currentIndex, isVisible]);

    return (
        <div style={styles.section} ref={containerRef}>
            <div style={styles.header}>
                <ImageIcon style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
            </div>

            {isVisible ? (
                <div 
                    style={styles.sliderContainer}
                    ref={sliderRef}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button 
                        style={{...styles.navBtn, left: '10px'}} 
                        onClick={prevSlide}
                        aria-label="Foto anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div style={styles.imageWrapper}>
                        {!isLoaded && <div style={styles.placeholder} />}
                        <img
                            src={fotos[currentIndex].src}
                            alt={fotos[currentIndex].alt}
                            style={{
                                ...styles.image,
                                opacity: isLoaded ? 1 : 0,
                                transition: 'opacity 0.3s ease'
                            }}
                            loading="lazy"
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>

                    <button 
                        style={{...styles.navBtn, right: '10px'}} 
                        onClick={nextSlide}
                        aria-label="Siguiente foto"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicadores */}
                    <div style={styles.indicators}>
                        {fotos.map((_, idx) => (
                            <button
                                key={idx}
                                style={{
                                    ...styles.dot,
                                    backgroundColor: idx === currentIndex ? '#4A90D9' : 'rgba(255,255,255,0.4)'
                                }}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setIsLoaded(false);
                                }}
                                aria-label={`Ir a foto ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ ...styles.sliderContainer, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={styles.placeholder} />
                </div>
            )}

            <p style={styles.hint}>Deslizá para ver más fotos</p>
        </div>
    );
};

const styles = {
    section: {
        backgroundColor: 'rgb(100, 180, 220)',
        padding: '40px 20px',
        textAlign: 'center',
    },
    header: {
        marginBottom: '24px',
    },
    icon: {
        width: '40px',
        height: 'auto',
        display: 'block',
        margin: '0 auto 12px auto',
    },
    sliderContainer: {
        position: 'relative',
        maxWidth: '400px',
        margin: '0 auto',
        touchAction: 'pan-y pinch-zoom',
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        aspectRatio: '3/4',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: 'rgba(200, 230, 255, 0.9)',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    placeholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(70, 130, 180, 0.3)',
        borderRadius: '16px',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    navBtn: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(30, 60, 90, 0.4)',
        border: 'none',
        color: '#fff',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
    },
    indicators: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '16px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    hint: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
        marginTop: '12px',
    },
};

export default BookSection;
