import React from 'react';
import { Diamond } from 'lucide-react';

const DressCodeSection = () => {
    return (
        <div style={styles.section}>
            <Diamond style={styles.icon} strokeWidth={1} color="#c97fa3" />
            <h2 style={styles.title}>DRESS CODE</h2>
            <p style={styles.subtitle}>FORMAL</p>
            <div style={styles.divider} />
            <p style={styles.text}>
                EL COLOR <strong style={styles.highlight}>ROSA</strong> SE RESERVA
                <br />
                PARA LA QUINCEAÑERA
            </p>
        </div>
    );
};

const styles = {
    section: {
        backgroundColor: 'rgba(100, 40, 70, 0.6)',
        padding: '50px 30px',
        textAlign: 'center',
    },
    icon: {
        width: '45px',
        height: '45px',
        margin: '0 auto 20px auto',
        display: 'block',
    },
    title: {
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '3px',
        marginBottom: '10px',
        color: '#fff',
    },
    subtitle: {
        fontSize: '16px',
        fontWeight: '300',
        letterSpacing: '4px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '20px',
    },
    divider: {
        width: '60px',
        height: '1px',
        backgroundColor: 'rgba(255,255,255,0.5)',
        margin: '0 auto 20px auto',
    },
    text: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: '1.8',
        letterSpacing: '1px',
        textTransform: 'uppercase',
    },
    highlight: {
        color: '#c97fa3',
        fontWeight: '700',
    },
};

export default DressCodeSection;
