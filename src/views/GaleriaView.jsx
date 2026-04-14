import React from 'react';
import { Camera } from 'lucide-react';
import AdminTrigger from '../components/AdminTrigger';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useMuro } from '../hooks/useMuro';
import { getOptimizedUrl } from '../utils/cloudinaryUtils';

const GaleriaView = () => {
    const { isAdmin } = useAuth();
    const isOnline = useOnlineStatus();
    const { fotos, progreso, handleSubir, handleEliminar } = useMuro();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <AdminTrigger>
                    <Camera style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                    <h2 style={styles.title}>Muro de Fotos</h2>
                </AdminTrigger>
                <p style={styles.subtitle}>Compartí tus mejores momentos de la noche</p>

                <input
                    type="file"
                    accept="image/*"
                    id="upload-btn"
                    onChange={handleSubir}
                    style={{ display: 'none' }}
                    disabled={!isOnline}
                />
                <label
                    htmlFor={isOnline ? "upload-btn" : ""}
                    style={{
                        ...styles.primaryBtn,
                        display: 'inline-block',
                        backgroundColor: isOnline ? '#c97fa3' : 'rgba(255,255,255,0.2)',
                        cursor: isOnline ? 'pointer' : 'not-allowed',
                        opacity: isOnline ? 1 : 0.6,
                    }}
                >
                    {progreso
                        ? 'Subiendo...'
                        : !isOnline
                        ? 'Sin conexión'
                        : '+ Subir foto'}
                </label>
            </div>

            {fotos.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyText}>Aún no hay fotos. ¡Sé el primero!</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {fotos.map(f => (
                        <div key={f.id} style={styles.photoCard}>
                            <img
                                loading="lazy"
                                src={getOptimizedUrl(f.url)}
                                alt="Foto XV"
                                style={styles.photo}
                            />
                            {isAdmin && (
                                <button
                                    onClick={() => handleEliminar(f.id)}
                                    style={styles.deleteBtn}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: '#FFFFFF',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px 16px',
        textAlign: 'center',
    },
    header: {
        marginBottom: '24px',
    },
    icon: {
        width: '48px',
        height: 'auto',
        display: 'block',
        margin: '0 auto 12px auto',
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        letterSpacing: '1px',
        margin: '0 0 6px 0',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.65)',
        margin: '0 0 20px 0',
    },
    primaryBtn: {
        backgroundColor: '#c97fa3',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '25px',
        padding: '13px 30px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
        letterSpacing: '0.5px',
        textAlign: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
    },
    photoCard: {
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.15)',
        position: 'relative',
        backgroundColor: 'rgba(141, 90, 115, 0.3)',
    },
    photo: {
        width: '100%',
        height: '160px',
        objectFit: 'cover',
        display: 'block',
    },
    deleteBtn: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        backgroundColor: 'rgba(180, 30, 30, 0.85)',
        border: 'none',
        color: 'white',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
    },
    emptyState: {
        backgroundColor: 'rgba(141, 90, 115, 0.3)',
        borderRadius: '16px',
        padding: '50px 20px',
        border: '1px solid rgba(255,255,255,0.12)',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '15px',
        margin: 0,
    },
};

export default GaleriaView;
