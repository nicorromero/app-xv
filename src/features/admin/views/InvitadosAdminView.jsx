import React, { useState, useEffect } from 'react';
import { Users, Mail, Trash2 } from 'lucide-react';
import { db } from '../../../services/firebase/config';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const InvitadosAdminView = () => {
    const [invitados, setInvitados] = useState([]);
    const [tab, setTab] = useState('todos'); // 'todos' | 'llegados'

    useEffect(() => {
        const q = query(collection(db, "invitados"), orderBy("nombre", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setInvitados(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const toggleArrived = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "invitados", id), {
                hasArrived: !currentStatus
            });
        } catch (error) {
            console.error("Error updating arrival status:", error);
            alert("Hubo un error al actualizar el estado.");
        }
    };

    const deleteInvitado = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${nombre} de la lista de invitados?`)) {
            try {
                await deleteDoc(doc(db, "invitados", id));
            } catch (error) {
                console.error("Error deleting guest:", error);
                alert("Hubo un error al eliminar el invitado.");
            }
        }
    };

    const llegados = invitados.filter(inv => inv.hasArrived === true);
    const mostrados = tab === 'todos' ? invitados : llegados;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Users style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                <h2 style={styles.title}>Gestor de Invitados</h2>
            </div>

            {/* Contador */}
            <div style={styles.statsCardWrapper}>
                <div style={styles.statsCard}>
                    <p style={styles.statsNum}>{invitados.length}</p>
                    <p style={styles.statsLabel}>Total</p>
                </div>
                <div style={{ ...styles.statsCard, backgroundColor: 'rgba(60, 180, 100, 0.3)', borderColor: 'rgba(60, 180, 100, 0.5)' }}>
                    <p style={styles.statsNum}>{llegados.length}</p>
                    <p style={styles.statsLabel}>En Evento</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                <button 
                    style={tab === 'todos' ? styles.tabActive : styles.tabInactive}
                    onClick={() => setTab('todos')}
                >
                    Confirmados ({invitados.length})
                </button>
                <button 
                    style={tab === 'llegados' ? styles.tabActiveArrival : styles.tabInactive}
                    onClick={() => setTab('llegados')}
                >
                    Ya Llegaron ({llegados.length})
                </button>
            </div>

            {/* Lista */}
            {mostrados.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyText}>No hay invitados en esta lista.</p>
                </div>
            ) : (
                <div style={styles.listContainer}>
                    {mostrados.map((inv, index) => (
                        <div key={inv.id} style={{ ...styles.invitadoCard, opacity: inv.hasArrived ? 0.7 : 1 }}>
                            <div style={inv.hasArrived ? styles.invitadoNumeroLlegado : styles.invitadoNumero}>
                                <span style={styles.numeroText}>{index + 1}</span>
                            </div>
                            <div style={styles.invitadoInfo}>
                                <p style={styles.invitadoNombre}>
                                    {inv.nombre} {inv.apellido || ''}
                                    {inv.hasArrived && <span style={{ marginLeft: 8, fontSize: '10px', backgroundColor: '#00cc66', color: '#fff', padding: '2px 6px', borderRadius: '8px' }}>Llegó</span>}
                                </p>
                                <div style={styles.invitadoEmail}>
                                    <Mail size={12} strokeWidth={1.5} color="rgba(255,255,255,0.5)" />
                                    <span style={styles.emailText}>{inv.email}</span>
                                </div>
                                {inv.nota && (
                                    <p style={styles.invitadoNota}>📝 {inv.nota}</p>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button 
                                    onClick={() => toggleArrived(inv.id, inv.hasArrived)}
                                    style={inv.hasArrived ? styles.btnUnarrive : styles.btnArrive}
                                >
                                    {inv.hasArrived ? 'Desmarcar' : '¡Llegó!'}
                                </button>
                                <button
                                    onClick={() => deleteInvitado(inv.id, inv.nombre)}
                                    style={styles.btnDelete}
                                    title="Eliminar invitado"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
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
        margin: 0,
        color: '#FFFFFF',
    },
    statsCardWrapper: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
    },
    statsCard: {
        flex: 1,
        backgroundColor: 'rgba(74, 144, 217, 0.3)',
        border: '1px solid rgba(74, 144, 217, 0.5)',
        borderRadius: '16px',
        padding: '16px',
        textAlign: 'center',
    },
    statsNum: {
        fontSize: '48px',
        fontWeight: '700',
        color: '#FFFFFF',
        margin: '0 0 4px 0',
        lineHeight: 1,
    },
    statsLabel: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: 0,
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    invitadoCard: {
        backgroundColor: 'rgba(141, 90, 115, 0.35)',
        borderRadius: '12px',
        padding: '14px 16px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
    },
    invitadoNumero: {
        backgroundColor: 'rgba(201, 127, 163, 0.4)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    numeroText: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#FFFFFF',
    },
    invitadoInfo: {
        flex: 1,
    },
    invitadoNombre: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#FFFFFF',
        margin: '0 0 4px 0',
    },
    invitadoEmail: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    emailText: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.55)',
    },
    invitadoNota: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
        margin: '6px 0 0 0',
        fontStyle: 'italic',
    },
    emptyState: {
        backgroundColor: 'rgba(141, 90, 115, 0.3)',
        borderRadius: '16px',
        padding: '50px 20px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.12)',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '15px',
        margin: 0,
    },
    tabsContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: '4px',
        borderRadius: '20px',
    },
    tabInactive: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        padding: '10px',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    tabActive: {
        flex: 1,
        backgroundColor: '#4A90D9',
        border: 'none',
        color: '#FFFFFF',
        padding: '10px',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(74, 144, 217, 0.4)',
        cursor: 'pointer',
    },
    tabActiveArrival: {
        flex: 1,
        backgroundColor: '#00cc66',
        border: 'none',
        color: '#FFFFFF',
        padding: '10px',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 204, 102, 0.4)',
        cursor: 'pointer',
    },
    invitadoNumeroLlegado: {
        backgroundColor: '#00cc66',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    btnArrive: {
        backgroundColor: '#00cc66',
        border: 'none',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0, 204, 102, 0.3)',
    },
    btnUnarrive: {
        backgroundColor: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'rgba(255,255,255,0.6)',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    btnDelete: {
        backgroundColor: 'rgba(255, 60, 60, 0.1)',
        border: '1px solid rgba(255, 60, 60, 0.4)',
        color: '#ff4d4d',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    }
};

export default InvitadosAdminView;
