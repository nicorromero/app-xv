import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
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
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'left', padding: '0 4px' }}>
            <h2 style={{ color: '#00ffcc', textShadow: '0 0 10px #00ffcc' }}>Gestor de Invitados</h2>
            <div style={{ 
                backgroundColor: 'rgba(0, 255, 204, 0.1)', 
                border: '1px solid #00ffcc', 
                padding: '15px', 
                borderRadius: '10px',
                marginBottom: '30px'
            }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Confirmados Totales: {invitados.length}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {invitados.map(inv => (
                    <div key={inv.id} style={{ 
                        backgroundColor: '#1a1a1a', 
                        padding: '15px', 
                        borderRadius: '10px',
                        borderLeft: '4px solid #e0218a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <strong style={{ color: '#fff', fontSize: '18px' }}>{inv.nombre}</strong>
                            <div style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>{inv.email}</div>
                        </div>
                    </div>
                ))}
            </div>

            {invitados.length === 0 && (
                <p style={{ color: '#777', textAlign: 'center', marginTop: '50px' }}>Aún no hay confirmados.</p>
            )}
        </div>
    );
};

export default InvitadosAdminView;
