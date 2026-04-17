import React, { useState } from 'react';
import { Gift, X, Copy, Check } from 'lucide-react';

const RegaloSection = () => {
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState({ alias: false, cvu: false });

    // Datos de la cuenta - modificá estos valores
    const datosCuenta = {
        alias: 'martinavic18',
        cvu: '0000003100073975043958'
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied({ ...copied, [field]: true });
            setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
        });
    };

    return (
        <>
            <div style={styles.section}>
                <Gift style={styles.icon} strokeWidth={1} color="#4A90D9" />
                <h2 style={styles.title}>REGALO</h2>
                <p style={styles.text}>
                    NADA ES MÁS IMPORTANTE QUE TU PRESENCIA, PERO SI DESEAS
                    HACERME UN REGALO SERÁ RECIBIDO CON MUCHO AMOR,
                    TAMBIÉN PUEDES HACERLO EN LA SIGUIENTE CUENTA
                </p>
                <button style={styles.button} onClick={() => setShowModal(true)}>
                    VER CUENTA
                </button>
            </div>

            {showModal && (
                <div style={styles.overlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                            <X size={24} />
                        </button>

                        <Gift style={styles.modalIcon} strokeWidth={1} color="#4A90D9" />
                        <h2 style={styles.modalTitle}>REGALO</h2>

                        <div style={styles.datosBox}>
                            <div style={styles.datoItem}>
                                <span style={styles.datoLabel}>ALIAS:</span>
                                <div style={styles.datoValue}>
                                    <span>{datosCuenta.alias}</span>
                                    <button
                                        style={styles.copyBtn}
                                        onClick={() => copyToClipboard(datosCuenta.alias, 'alias')}
                                    >
                                        {copied.alias ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.datoItem}>
                                <span style={styles.datoLabel}>CVU:</span>
                                <div style={styles.datoValue}>
                                    <span>{datosCuenta.cvu}</span>
                                    <button
                                        style={styles.copyBtn}
                                        onClick={() => copyToClipboard(datosCuenta.cvu, 'cvu')}
                                    >
                                        {copied.cvu ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const styles = {
    section: {
        backgroundColor: 'rgba(25, 55, 85, 0.6)',
        padding: '50px 30px',
        textAlign: 'center',
    },
    icon: {
        width: '50px',
        height: '50px',
        margin: '0 auto 20px auto',
        display: 'block',
    },
    title: {
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '3px',
        marginBottom: '20px',
        color: '#fff',
    },
    text: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.85)',
        lineHeight: '1.8',
        maxWidth: '320px',
        margin: '0 auto 25px auto',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    button: {
        backgroundColor: 'transparent',
        border: '1px solid rgba(255,255,255,0.6)',
        color: '#fff',
        padding: '12px 30px',
        fontSize: '13px',
        letterSpacing: '2px',
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
        textTransform: 'uppercase',
    },

    // Modal styles
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1000000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    modal: {
        backgroundColor: 'rgba(35, 65, 95, 0.95)',
        borderRadius: '0',
        padding: '40px 30px',
        maxWidth: '320px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.3)',
    },
    closeBtn: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        padding: '5px',
    },
    modalIcon: {
        width: '45px',
        height: '45px',
        margin: '0 auto 15px auto',
        display: 'block',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '700',
        letterSpacing: '3px',
        marginBottom: '30px',
        color: '#fff',
    },
    datosBox: {
        border: '1px solid rgba(255,255,255,0.4)',
        padding: '25px 20px',
    },
    datoItem: {
        marginBottom: '20px',
        '&:last-child': {
            marginBottom: 0,
        },
    },
    datoLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: '2px',
        color: '#fff',
        marginBottom: '8px',
    },
    datoValue: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '1px',
        wordBreak: 'break-all',
    },
    copyBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        opacity: 0.7,
        '&:hover': {
            opacity: 1,
        },
    },
};

export default RegaloSection;
