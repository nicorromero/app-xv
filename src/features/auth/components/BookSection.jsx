import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

// Importar imágenes para que Vite las procese correctamente
const book1 = '/images/book/book1.jpeg';
const book2 = '/images/book/book2.jpeg';
const book3 = '/images/book/book3.jpeg';
const book4 = '/images/book/book4.jpeg';
const book5 = '/images/book/book5.jpeg';
const book6 = '/images/book/book6.jpeg';
const book7 = '/images/book/book7.jpeg';
const book8 = '/images/book/book8.jpeg';
const book9 = '/images/book/book9.jpeg';
const book10 = '/images/book/book10.jpeg';
const book11 = '/images/book/book11.jpeg';
const book12 = '/images/book/book12.jpeg';
const book13 = '/images/book/book13.jpeg';
const book14 = '/images/book/book14.jpeg';
const book15 = '/images/book/book15.jpeg';
const book16 = '/images/book/book16.jpeg';
const book17 = '/images/book/book17.jpeg';
const book18 = '/images/book/book18.jpeg';
const book19 = '/images/book/book19.jpeg';


export const bookUno = [
    { id: 1, src: book1, alt: 'Foto 1' },
    { id: 2, src: book2, alt: 'Foto 2' },
    { id: 3, src: book3, alt: 'Foto 3' },
    { id: 4, src: book4, alt: 'Foto 4' },
    { id: 5, src: book5, alt: 'Foto 5' },
    { id: 6, src: book6, alt: 'Foto 6' },
    { id: 7, src: book7, alt: 'Foto 7' },
];

export const bookDos = [
    { id: 1, src: book8, alt: 'Foto 1' },
    { id: 2, src: book9, alt: 'Foto 2' },
    { id: 3, src: book10, alt: 'Foto 3' },
    { id: 4, src: book11, alt: 'Foto 4' },
    { id: 5, src: book12, alt: 'Foto 5' },
    { id: 6, src: book13, alt: 'Foto 6' },
    { id: 7, src: book14, alt: 'Foto 7' },
];

export const bookTres = [
    { id: 1, src: book15, alt: 'Foto 1' },
    { id: 2, src: book16, alt: 'Foto 2' },
    { id: 3, src: book17, alt: 'Foto 3' },
    { id: 4, src: book18, alt: 'Foto 4' },
    { id: 5, src: book19, alt: 'Foto 5' },
];

const BookSection = ({ 
    fotos = bookUno 
}) => {
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
