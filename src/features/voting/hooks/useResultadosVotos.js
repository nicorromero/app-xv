import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../../services/firebase/config';
import { collection, onSnapshot, doc, setDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const QUEUE_KEY = 'offline_sync_queue';
const VOTES_KEY = 'pending_votes';

export const useResultadosVotos = () => {
    const [votos, setVotos] = useState({});
    const [pendingSync, setPendingSync] = useState(0);

    // Cargar contador de pendientes
    useEffect(() => {
        const updatePending = () => {
            try {
                const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
                setPendingSync(queue.filter(op => op.type === 'voto').length);
            } catch {
                setPendingSync(0);
            }
        };
        updatePending();
        window.addEventListener('storage', updatePending);
        return () => window.removeEventListener('storage', updatePending);
    }, []);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const unsubVotos = onSnapshot(collection(db, "resultados_votos"), (snap) => {
                    const counts = {};
                    snap.forEach(document => {
                        counts[document.id] = document.data();
                    });
                    setVotos(counts);
                });
                return () => unsubVotos();
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Agregar voto a cola offline
    const queueVotoOffline = useCallback((categoriaId, candidato) => {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            queue.push({
                id: `voto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'voto',
                data: { categoriaId, candidato },
                timestamp: Date.now(),
                attempts: 0
            });
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            
            // Guardar en pending votes
            const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
            votes[categoriaId] = { candidato, timestamp: Date.now() };
            localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
            
            setPendingSync(prev => prev + 1);
        } catch (e) {
            console.error('Error encolando voto:', e);
        }
    }, []);

    // Intentar emitir voto (online) o guardar en cola (offline)
    const emitirVoto = useCallback(async (categoriaId, candidato, isOnline = true) => {
        localStorage.setItem(`voto_${categoriaId}`, 'true');
        
        if (!isOnline) {
            queueVotoOffline(categoriaId, candidato);
            return { success: false, queued: true };
        }

        const docRef = doc(db, "resultados_votos", categoriaId);

        try {
            await setDoc(docRef, {
                [candidato]: increment(1)
            }, { merge: true });
            return { success: true, queued: false };
        } catch (error) {
            console.error("Error al emitir voto:", error);
            // Si falla, encolar para retry
            queueVotoOffline(categoriaId, candidato);
            return { success: false, queued: true, error };
        }
    }, [queueVotoOffline]);

    // Sincronizar votos pendientes
    const syncPendingVotes = useCallback(async () => {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            const votoOps = queue.filter(op => op.type === 'voto');
            
            for (const op of votoOps) {
                try {
                    const { categoriaId, candidato } = op.data;
                    const docRef = doc(db, "resultados_votos", categoriaId);
                    await setDoc(docRef, {
                        [candidato]: increment(1)
                    }, { merge: true });
                    
                    // Remover de la cola
                    const newQueue = queue.filter(q => q.id !== op.id);
                    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
                } catch (e) {
                    console.error('Error sincronizando voto:', e);
                }
            }
            
            setPendingSync(0);
        } catch (e) {
            console.error('Error en sync:', e);
        }
    }, []);

    return { votos, emitirVoto, pendingSync, syncPendingVotes };
};