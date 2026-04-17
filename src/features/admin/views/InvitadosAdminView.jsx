import React, { useState, useEffect } from 'react';
import { Users, Mail } from 'lucide-react';
import { db } from '../../../services/firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const InvitadosAdminView = () => {
    const [invitados, setInvitados] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "invitados"), orderBy("nombre", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setInvitados(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Users style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                <h2 style={styles.title}>Gestor de Invitados</h2>
            </div>

            {/* Contador */}
            <div style={styles.statsCard}>
                <p style={styles.statsNum}>{invitados.length}</p>
                <p style={styles.statsLabel}>Confirmados totales</p>
            </div>

            {/* Lista */}
            {invitados.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyText}>Aún no hay confirmados.</p>
                </div>
            ) : (
                <div style={styles.listContainer}>
                    {invitados.map((inv, index) => (
                        <div key={inv.id} style={styles.invitadoCard}>
                            <div style={styles.invitadoNumero}>
                                <span style={styles.numeroText}>{index + 1}</span>
                            </div>
                            <div style={styles.invitadoInfo}>
                                <p style={styles.invitadoNombre}>
                                    {inv.nombre} {inv.apellido || ''}
                                </p>
                                <div style={styles.invitadoEmail}>
                                    <Mail size={12} strokeWidth={1.5} color="rgba(255,255,255,0.5)" />
                                    <span style={styles.emailText}>{inv.email}</span>
                                </div>
                                {inv.nota && (
                                    <p style={styles.invitadoNota}>📝 {inv.nota}</p>
                                )}
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
    statsCard: {
        backgroundColor: 'rgba(74, 144, 217, 0.3)',
        border: '1px solid rgba(74, 144, 217, 0.5)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '20px',
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
};

export default InvitadosAdminView;
