import React, { useEffect, useState } from 'react';

export const SafariEnforcer = () => {
    const [showBlocker, setShowBlocker] = useState(false);
    const [browserInfo, setBrowserInfo] = useState({});

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
        
        // Safari en iOS NO tiene estos strings, solo tiene "Safari" pero no es exclusivo
        // La forma más confiable de detectar Safari puro en iOS es:
        // - Es iOS
        // - NO es Chrome, Firefox, Edge, Opera, Brave
        // - Y tiene "Safari" en el user agent (todos los browser en iOS tienen esto, es WebKit)
        const isSafari = isIOS && !isChromeIOS && !isFirefoxIOS && !isEdgeIOS && !isOperaIOS && !isBraveIOS;
        
        // Si es iOS pero NO es Safari nativo, mostrar bloqueo
        const shouldBlock = isIOS && !isSafari;
        
        setBrowserInfo({
            isIOS,
            isSafari,
            isChromeIOS,
            isFirefoxIOS,
            isEdgeIOS,
            isOperaIOS,
            isBraveIOS,
            browserName: isChromeIOS ? 'Chrome' : 
                        isFirefoxIOS ? 'Firefox' : 
                        isEdgeIOS ? 'Edge' : 
                        isOperaIOS ? 'Opera' : 
                        isBraveIOS ? 'Brave' : 'Safari'
        });
        
        setShowBlocker(shouldBlock);
    }, []);

    // Función para copiar la URL al portapapeles
    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('URL copiada. Ahora abrí Safari y pegala.');
        }).catch(() => {
            // Fallback: seleccionar todo
            const range = document.createRange();
            const selection = window.getSelection();
            const urlElement = document.getElementById('current-url');
            if (urlElement) {
                range.selectNodeContents(urlElement);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    };

    // Intentar abrir en Safari (funciona en algunos casos)
    const tryOpenSafari = () => {
        // Guardar URL actual
        const currentUrl = window.location.href;
        
        // Intentar scheme x-safari-
        window.location.href = 'x-safari-' + currentUrl;
        
        // Fallback después de 500ms si no funcionó
        setTimeout(() => {
            copyUrl();
        }, 500);
    };

    if (!showBlocker) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.icon}>🧭</div>
                <h2 style={styles.title}>Abrí esta app en Safari</h2>
                <p style={styles.text}>
                    Estás usando <strong>{browserInfo.browserName}</strong> en iPhone. 
                    Para que la app funcione correctamente con todas las funciones offline, 
                    necesitás usar <strong>Safari</strong>.
                </p>
                
                <div style={styles.steps}>
                    <div style={styles.step}>
                        <span style={styles.stepNum}>1</span>
                        <span>Tocá el botón de compartir <strong>⎋</strong> arriba</span>
                    </div>
                    <div style={styles.step}>
                        <span style={styles.stepNum}>2</span>
                        <span>Seleccioná "Abrir en Safari"</span>
                    </div>
                    <div style={styles.step}>
                        <span style={styles.stepNum}>3</span>
                        <span>O copiá la URL y pegala en Safari</span>
                    </div>
                </div>

                <div style={styles.urlBox}>
                    <span id="current-url" style={styles.url}>{window.location.href}</span>
                    <button onClick={copyUrl} style={styles.copyBtn}>
                        Copiar URL
                    </button>
                </div>

                <button onClick={tryOpenSafari} style={styles.openBtn}>
                    Intentar abrir en Safari
                </button>
                
                <p style={styles.small}>
                    Si no podés abrirlo, copiá la URL y pegala manualmente en Safari
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    modal: {
        backgroundColor: '#1a0a1a',
        borderRadius: '20px',
        padding: '30px 24px',
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid #e0218a',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    title: {
        color: '#fff',
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '12px',
    },
    text: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: '15px',
        lineHeight: '1.5',
        marginBottom: '20px',
    },
    steps: {
        textAlign: 'left',
        marginBottom: '20px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '16px',
    },
    step: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '14px',
    },
    stepNum: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#e0218a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    urlBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px',
        wordBreak: 'break-all',
    },
    url: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '13px',
        display: 'block',
        marginBottom: '8px',
    },
    copyBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '13px',
        cursor: 'pointer',
    },
    openBtn: {
        backgroundColor: '#e0218a',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '12px',
    },
    small: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px',
    },
};

export default SafariEnforcer;
