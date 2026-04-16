import React from 'react';
import heroBg from '../../assets/book19.jpeg';

/**
 * HeroSection — Sección estática de la página de Login.
 * Contiene: título del evento y cuenta regresiva.
 */
const HeroSection = ({ timeLeft }) => {
    return (
        <div style={styles.sectionHero}>
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
    );
};

const styles = {
    sectionHero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '60px 20px 40px 20px',
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
