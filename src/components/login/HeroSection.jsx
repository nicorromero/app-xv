import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

/**
 * HeroSection — Sección estática de la página de Login.
 * Contiene: título del evento, cuenta regresiva, info de fecha/lugar.
 */
const HeroSection = ({ timeLeft }) => {
    return (
        <>
            {/* SECCIÓN 1 — HERO */}
            <div style={styles.sectionHero}>
                <p style={styles.heroSubText}>MIS 15</p>
                <h1 style={styles.heroTitle}>Paulina</h1>
                <p style={styles.heroDate}>26 · SEPTIEMBRE · 2026</p>
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

            {/* SECCIÓN 2 — INFO DEL EVENTO */}
            <div style={styles.section2}>
                <div style={styles.eventItem}>
                    <Calendar style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                    <p style={styles.labelSmall}>¿CUÁNDO?</p>
                    <p style={styles.labelLarge}>26 DE SEPTIEMBRE 2026 | 20:00 HS</p>
                </div>
                <div style={styles.separator}></div>
                <div style={styles.eventItem}>
                    <MapPin style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                    <p style={styles.labelSmall}>¿DÓNDE?</p>
                    <p style={styles.labelLarge}>JANO'S PUERTO MADERO</p>
                    <button
                        style={styles.outlineBtn}
                        onClick={() => window.open('https://maps.google.com', '_blank')}
                    >
                        CÓMO LLEGAR
                    </button>
                </div>
            </div>
        </>
    );
};

const styles = {
    sectionHero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px',
    },
    heroSubText: {
        textTransform: 'uppercase',
        letterSpacing: '4px',
        fontSize: '14px',
        margin: '0 0 10px 0',
    },
    heroTitle: {
        fontFamily: "'Great Vibes', cursive",
        fontSize: '72px',
        margin: '0 0 10px 0',
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
        backgroundColor: 'rgba(100, 40, 70, 0.8)',
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
    section2: {
        backgroundColor: '#7d4e6a',
        padding: '60px 30px',
        textAlign: 'center',
    },
    eventItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconGraphic: {
        width: '60px',
        height: 'auto',
        display: 'block',
        margin: '0 auto 15px auto',
    },
    labelSmall: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '5px',
    },
    labelLarge: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    separator: {
        height: '1px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        margin: '30px 0',
        width: '100%',
    },
    outlineBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #FFFFFF',
        color: '#FFFFFF',
        borderRadius: '25px',
        padding: '12px 25px',
        fontSize: '14px',
        cursor: 'pointer',
    },
};

export default HeroSection;
