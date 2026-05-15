import React from 'react';
import Countdown from './Countdown';

const heroBg = '/images/book/book19.jpeg';

/**
 * HeroSection — Sección estática de la página de Login.
 * Contiene: título del evento y cuenta regresiva.
 */
const HeroSection = () => {
    return (
        <div style={styles.sectionHero}>
            {/* Imagen principal (LCP) con alta prioridad */}
            <img 
                src={heroBg} 
                alt="Fondo de la portada" 
                style={styles.bgImage} 
                fetchPriority="high"
            />
            <div style={styles.heroOverlay}>
                <div style={styles.headerGroup}>
                    <p style={styles.heroSubText}>MIS 15</p>
                    <h1 style={styles.heroTitle}>Martina</h1>
                </div>
                <Countdown />
            </div>
        </div>
    );
};

const styles = {
    sectionHero: {
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
    },
    bgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
    },
    heroOverlay: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100vh',
        width: '100%',
        padding: '60px 20px 40px 20px',
        boxSizing: 'border-box',
    },
    headerGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heroSubText: {
        textTransform: 'uppercase',
        letterSpacing: '4px',
        fontSize: '14px',
        margin: '0 0 2px 0',
    },
    heroTitle: {
        fontFamily: "'Great Vibes', cursive",
        fontSize: '72px',
        margin: '2px 0 0 0',
        fontWeight: 'normal',
    },
};

export default HeroSection;
