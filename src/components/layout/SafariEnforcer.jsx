import React, { useEffect, useState } from 'react';
import { X, Compass } from 'lucide-react';

export const SafariEnforcer = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Verificar si el usuario ya cerró el banner antes
        const dismissed = localStorage.getItem('safariBannerDismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

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
        
        // Mostrar recomendación si es iOS pero no Safari
        setShowBanner(isIOS && !isSafari);
    }, []);

    const openInSafari = () => {
        const currentUrl = window.location.href;
        // Intentar abrir en Safari usando el scheme
        window.location.href = 'x-safari-' + currentUrl;
    };

    const dismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('safariBannerDismissed', 'true');
    };

    if (!showBanner || isDismissed) return null;

    return (
        <div style={styles.banner}>
            <div style={styles.content}>
                <Compass size={20} color="#00d4aa" style={styles.icon} />
                <span style={styles.text}>
                    <strong>Tip:</strong> Usá Safari para una mejor experiencia
                </span>
            </div>
            <div style={styles.actions}>
                <button onClick={openInSafari} style={styles.linkBtn}>
                    Abrir en Safari
                </button>
                <button onClick={dismiss} style={styles.closeBtn} aria-label="Cerrar">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

const styles = {
    banner: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '12px',
        borderBottom: '1px solid rgba(0, 212, 170, 0.3)',
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flex: 1,
    },
    icon: {
        flexShrink: 0,
    },
    text: {
        color: '#fff',
        fontSize: '13px',
        lineHeight: '1.4',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
    },
    linkBtn: {
        backgroundColor: '#00d4aa',
        color: '#000',
        border: 'none',
        borderRadius: '16px',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    closeBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default SafariEnforcer;
