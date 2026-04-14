import React, { useEffect, useState } from 'react';

export const SafariEnforcer = () => {
    const [showBlocker, setShowBlocker] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent;
        
        // Detectar iOS
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        
        // Detectar navegadores específicos en iOS
        const isChromeIOS = /CriOS/.test(ua);
        const isFirefoxIOS = /FxiOS/.test(ua);
        const isEdgeIOS = /EdgiOS/.test(ua);
        const isOperaIOS = /OPiOS/.test(ua);
        const isBraveIOS = /Brave/.test(ua) && isIOS;
        
        // Safari puro = iOS pero no es otro browser
        const isSafari = isIOS && !isChromeIOS && !isFirefoxIOS && !isEdgeIOS && !isOperaIOS && !isBraveIOS;
        
        // Bloquear si es iOS pero no Safari
        setShowBlocker(isIOS && !isSafari);
    }, []);

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('URL copiada. Abrí Safari y pegala.');
        });
    };

    if (!showBlocker) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Abrí en Safari</h2>
                <p style={styles.text}>
                    Esta app funciona mejor en Safari.
                </p>

                <button onClick={copyUrl} style={styles.copyBtn}>
                    Copiar link
                </button>

                <p style={styles.small}>
                    Pegalo en Safari y seguí disfrutando
                </p>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 10, 26, 0.98)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    modal: {
        textAlign: 'center',
        maxWidth: '280px',
    },
    title: {
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '12px',
        fontFamily: "'Great Vibes', cursive",
    },
    text: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        marginBottom: '24px',
    },
    copyBtn: {
        backgroundColor: '#e0218a',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        padding: '12px 32px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    small: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        marginTop: '16px',
    },
};

export default SafariEnforcer;
