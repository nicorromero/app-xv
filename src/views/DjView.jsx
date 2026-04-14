import React from 'react';
import { Music } from 'lucide-react';
import { usePedidosDj } from '../hooks/usePedidosDj';

function DjView() {
    const { pedidos, nuevaCancion, setNuevaCancion, enviarPedido } = usePedidosDj();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Music style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                <h2 style={styles.title}>Pedile un tema al DJ</h2>
                <p style={styles.subtitle}>Tu canción sonará en la fiesta</p>
            </div>

            <div style={styles.card}>
                <form onSubmit={enviarPedido} style={styles.form}>
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

            {pedidos.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.sectionLabel}>Pedidos recientes</h3>
                    <div style={styles.listContainer}>
                        {pedidos.map(p => (
                            <div key={p.id} style={styles.listItem}>
                                <span style={styles.listItemTitle}>{p.nombre}</span>
                                <span style={styles.listItemSub}>{p.artista}</span>
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
        backgroundColor: 'rgba(141, 90, 115, 0.45)',
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
        backgroundColor: '#c97fa3',
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
        flexDirection: 'column',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        paddingBottom: '10px',
    },
    listItemTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#FFFFFF',
    },
    listItemSub: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        marginTop: '2px',
    },
};

export default DjView;
