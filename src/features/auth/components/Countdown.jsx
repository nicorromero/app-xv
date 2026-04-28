import React, { useState, useEffect } from 'react';

/**
 * Countdown — Componente de cuenta regresiva aislado.
 * Maneja su propio estado y efecto para evitar re-renderizados en el componente padre.
 */
const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

    useEffect(() => {
        const fechaEvento = new Date('2026-05-23T20:00:00').getTime();
        const interval = setInterval(() => {
            const distance = fechaEvento - Date.now();
            if (distance < 0) {
                setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
                clearInterval(interval);
                return;
            }
            setTimeLeft({
                dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
                horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                segundos: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
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
    );
};

const styles = {
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

export default Countdown;
