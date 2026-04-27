import React from 'react';
const heroBg = '/images/book/book19.jpeg';

/**
 * HeroSection — Sección estática de la página de Login.
 * Contiene: título del evento y cuenta regresiva.
 */
const HeroSection = ({ timeLeft }) => {
    return (
        <div style={styles.sectionHero}>
            {/* Imagen principal (LCP) con alta prioridad */}
            <img 
                src={heroBg} 
                alt="Fondo de la portada" 
                style={styles.bgImage} 
                fetchpriority="high" 
            />
            <div style={styles.heroOverlay}>
                <div style={styles.headerGroup}>
                    <p style={styles.heroSubText}>MIS 15</p>
                    <h1 style={styles.heroTitle}>Martina</h1>
                </div>
            <div style={styles.countdownContainer}>
                <div style={styles.timeBox}>
                    <span style={styles.timeNum}>{timeLeft.dias}</span>
                    <span style={styles.timeLabel}>DÍAS</span>
                </div>
                <div style={styles.timeBox}>
                    <span style={styles.timeNum}>{timeLeft.horas}</span>
                    <span style={styles.timeLabel}>HS</span>
                </div>
                <div style={styles.timeBox}>
                    <span style={styles.timeNum}>{timeLeft.minutos}</span>
                    <span style={styles.timeLabel}>MIN</span>
                </div>
                <div style={styles.timeBox}>
                    <span style={styles.timeNum}>{timeLeft.segundos}</span>
                    <span style={styles.timeLabel}>SEG</span>
                </div>
            </div>            
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
    heroDate: {
        textTransform: 'uppercase',
        fontWeight: '300',
        fontSize: '14px',
        margin: '0 0 40px 0',
    },
    countdownContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '40px',
    },
    timeBox: {
        backgroundColor: 'rgba(25, 55, 85, 0.8)',
        borderRadius: '12px',
        padding: '15px 10px',
        minWidth: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    timeNum: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    timeLabel: {
        fontSize: '10px',
    },
};

export default HeroSection;
