import React, { useEffect } from 'react';
import { Music, CloudOff, CheckCircle } from 'lucide-react';
import { usePedidosDj } from '../hooks/usePedidosDj';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useAuth } from '../../../context/AuthContext';
import { Trash2 } from 'lucide-react';

function DjView() {
    const isOnline = useOnlineStatus();
    const { isAdmin } = useAuth();
    const { allPedidos, nuevaCancion, setNuevaCancion, enviarPedido, borrarPedido, pendingCount, syncPendingPedidos } = usePedidosDj();

    // Sincronizar al volver online
    useEffect(() => {
        if (isOnline && pendingCount > 0) {
            const timer = setTimeout(() => {
                syncPendingPedidos();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOnline, pendingCount, syncPendingPedidos]);

    const handleSubmit = async (e) => {
        const result = await enviarPedido(e, isOnline);
        
        if (result.success) {
            alert("¡Pedido enviado al DJ!");
        } else if (result.queued) {
            alert("Pedido guardado. Se enviará cuando haya conexión.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Music style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                <h2 style={styles.title}>Pedile un tema al DJ</h2>
                <p style={styles.subtitle}>Tu canción sonará en la fiesta</p>
            </div>

            {!isOnline && pendingCount > 0 && (
                <div style={styles.offlineBanner}>
                    <CloudOff size={16} />
                    <span>{pendingCount} pedido(s) pendiente(s) de sincronizar</span>
                </div>
            )}

            <div style={styles.card}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        placeholder="Nombre de la canción"
                        value={nuevaCancion.nombre}
                        onChange={(e) => setNuevaCancion({ ...nuevaCancion, nombre: e.target.value })}
                        style={styles.input}
                    />
                    <input
                        placeholder="Artista"
                        value={nuevaCancion.artista}
                        onChange={(e) => setNuevaCancion({ ...nuevaCancion, artista: e.target.value })}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.primaryBtn}>
                        Enviar Pedido
                    </button>
                </form>
            </div>

            {allPedidos.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.sectionLabel}>
                        Pedidos recientes
                        {!isOnline && pendingCount > 0 && (
                            <span style={styles.pendingTag}>{pendingCount} pendientes</span>
                        )}
                    </h3>
                    <div style={styles.listContainer}>
                        {allPedidos.slice(0, 10).map(p => (
                            <div key={p.id} style={{ ...styles.listItem, opacity: p.isLocal ? 0.7 : 1 }}>
                                <div style={{ flex: 1 }}>
                                    <span style={styles.listItemTitle}>
                                        {p.nombre}
                                        {p.isLocal && <CloudOff size={12} style={{ marginLeft: 8, opacity: 0.6 }} />}
                                    </span>
                                    <span style={styles.listItemSub}>{p.artista}</span>
                                </div>
                                {isAdmin && !p.isLocal && (
                                    <button
                                        onClick={() => borrarPedido(p.id)}
                                        style={styles.deleteBtn}
                                        title="Eliminar canción"
                                    >
                                        <Trash2 size={18} color="#ff6b6b" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: '#FFFFFF',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px 16px',
    },
    header: {
        textAlign: 'center',
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
        margin: 0,
    },
    card: {
        backgroundColor: 'rgba(70, 130, 180, 0.45)',
        borderRadius: '16px',
        padding: '24px 20px',
        marginBottom: '16px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.35)',
        color: '#FFFFFF',
        padding: '13px 14px',
        fontSize: '15px',
        outline: 'none',
        fontFamily: "'Montserrat', sans-serif",
        borderRadius: '4px',
    },
    primaryBtn: {
        backgroundColor: '#4A90D9',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '25px',
        padding: '14px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        width: '100%',
        fontFamily: "'Montserrat', sans-serif",
        letterSpacing: '0.5px',
    },
    sectionLabel: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: '0 0 16px 0',
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    listItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        paddingBottom: '10px',
    },
    listItemTitle: {
        display: 'block',
        fontSize: '15px',
        fontWeight: '600',
        color: '#FFFFFF',
    },
    listItemSub: {
        display: 'block',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        marginTop: '2px',
    },
    deleteBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'background-color 0.2s',
    },
    offlineBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 165, 0, 0.15)',
        border: '1px solid rgba(255, 165, 0, 0.3)',
        borderRadius: '12px',
        marginBottom: '16px',
        color: '#ffa500',
        fontSize: '14px',
    },
    pendingTag: {
        marginLeft: '8px',
        padding: '3px 8px',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        color: '#ffa500',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: '600',
    },
};

export default DjView;
