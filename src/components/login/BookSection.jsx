import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

// Importar imágenes para que Vite las procese correctamente
import book1 from '../../assets/book.png';
import book2 from '../../assets/book2.png';
import book3 from '../../assets/book3.png';

const fotos = [
    { id: 1, src: book1, alt: 'Foto 1' },
    { id: 2, src: book2, alt: 'Foto 2' },
    { id: 3, src: book3, alt: 'Foto 3' },
];

const BookSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const sliderRef = useRef(null);

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

    // Precargar siguiente imagen
    useEffect(() => {
        const nextIndex = (currentIndex + 1) % fotos.length;
        const img = new Image();
        img.src = fotos[nextIndex].src;
    }, [currentIndex]);

    return (
        <div style={styles.section}>
            <div style={styles.header}>
                <ImageIcon style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                <h2 style={styles.title}>BOOK DE FOTOS</h2>
                <p style={styles.subtitle}>Algunos recuerdos de Paulina</p>
            </div>

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
                                backgroundColor: idx === currentIndex ? '#c97fa3' : 'rgba(255,255,255,0.4)'
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

            <p style={styles.hint}>Deslizá para ver más fotos</p>
        </div>
    );
};

const styles = {
    section: {
        backgroundColor: 'rgba(100, 40, 70, 0.4)',
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
    title: {
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '2px',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.7)',
        margin: 0,
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
        backgroundColor: 'rgba(141, 90, 115, 0.3)',
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
        backgroundColor: 'rgba(141, 90, 115, 0.3)',
        borderRadius: '16px',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    navBtn: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.4)',
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
