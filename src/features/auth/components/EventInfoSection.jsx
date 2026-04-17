import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

/**
 * EventInfoSection — Información del evento (fecha y lugar).
 * Componente extraído de HeroSection para permitir mayor flexibilidad.
 */
const EventInfoSection = () => {
    return (
        <div style={styles.container}>
            <div style={styles.eventItem}>
                <Calendar style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                <p style={styles.labelSmall}>¿CUÁNDO?</p>
                <p style={styles.labelLarge}>23 DE MAYO 2026 | 21:30 HS</p>
            </div>
            <div style={styles.separator}></div>
            <div style={styles.eventItem}>
                <MapPin style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                <p style={styles.labelSmall}>¿DÓNDE?</p>
                <p style={styles.labelLarge}>Las Lilas, C. del Uruguay</p>
                <button
                    style={styles.outlineBtn}
                    onClick={() => window.open('https://maps.app.goo.gl/RX5MPibSYWWFjz4Y6', '_blank')}
                >
                    CÓMO LLEGAR
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#2E5C8A',
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

export default EventInfoSection;
