import { useState, useEffect, useCallback } from 'react';
import { app, perf } from '../../../services/firebase/app';
import { db } from '../../../services/firebase/db';
import { collection, onSnapshot, doc, setDoc, increment } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { trace as traceMetric } from 'firebase/performance';
import { logger } from '../../../services/firebase/logger';

const auth = getAuth(app);

const QUEUE_KEY = 'offline_sync_queue';
const VOTES_KEY = 'pending_votes';
const NUM_SHARDS = 20;

/**
 * Hook to manage voting results and submission with offline support and optimistic UI.
 * @param {string|null} categoriaIdActiva - Current active category ID to listen for.
 * @returns {Object} { votos, emitirVoto, pendingSync, syncPendingVotes }
 */
export const useResultadosVotos = (categoriaIdActiva = null) => {
    const [votos, setVotos] = useState({});
    const [pendingSync, setPendingSync] = useState(0);

    // Load pending sync count from localStorage
    useEffect(() => {
        const updatePending = () => {
            try {
                const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
                setPendingSync(queue.filter(op => op.type === 'voto').length);
            } catch (err) {
                logger.error('Error loading pending sync count', err);
                setPendingSync(0);
            }
        };
        updatePending();
        window.addEventListener('storage', updatePending);
        return () => window.removeEventListener('storage', updatePending);
    }, []);

    // Listen for real-time updates of votes (sharded counter)
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && categoriaIdActiva) {
                const votesRef = collection(db, "resultados_votos", categoriaIdActiva, "votes");
                const unsubVotos = onSnapshot(votesRef, (snap) => {
                    const counts = {};
                    snap.forEach(document => {
                        const { candidato } = document.data();
                        if (candidato) {
                            counts[candidato] = (counts[candidato] || 0) + 1;
                        }
                    });
                    setVotos({ [categoriaIdActiva]: counts });
                }, (err) => {
                    logger.error(`Error listening to votes for ${categoriaIdActiva}`, err);
                });
                return () => unsubVotos();
            } else if (!categoriaIdActiva) {
                setVotos({});
            }
        });

        return () => unsubscribeAuth();
    }, [categoriaIdActiva]);

    /**
     * Internal: Queues a vote for background synchronization
     */
    const queueVotoOffline = useCallback((categoriaId, candidato) => {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            const voteId = `voto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            queue.push({
                id: voteId,
                type: 'voto',
                data: { categoriaId, candidato },
                timestamp: Date.now(),
                attempts: 0
            });
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

            // Mark as pending in local state for UI persistence
            const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
            votes[categoriaId] = { candidato, timestamp: Date.now() };
            localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

            setPendingSync(prev => prev + 1);
            logger.info('vote_queued_offline', { categoriaId, candidato, voteId });
        } catch (e) {
            logger.error('Error encolando voto offline', e, { categoriaId, candidato });
        }
    }, []);

    /**
     * Submits a vote. Implements optimistic marking via localStorage.
     * @param {string} categoriaId 
     * @param {string} candidato 
     * @param {boolean} isOnline 
     * @returns {Promise<{success: boolean, queued: boolean, error?: any}>}
     */
    const emitirVoto = useCallback(async (categoriaId, candidato, isOnline = true) => {
        // Optimistic: Mark as voted immediately in localStorage
        localStorage.setItem(`voto_${categoriaId}`, 'true');

        if (!isOnline) {
            queueVotoOffline(categoriaId, candidato);
            return { success: false, queued: true };
        }

        const trace = traceMetric(perf, "proceso_voto_completo");
        trace.start();

        const userId = auth.currentUser.uid;
        const docRef = doc(db, "resultados_votos", categoriaId, "votes", userId);

        try {
            await setDoc(docRef, {
                candidato: candidato,
                timestamp: Date.now()
            });
            
            trace.stop();
            logger.info('vote_submitted_success', { categoriaId, candidato });
            return { success: true, queued: false };
        } catch (error) {
            trace.stop();
            logger.error("Error al emitir voto online, reintentando offline", error, { categoriaId, candidato });
            
            // Rollback optimistic state if even queuing fails (though here we queue it as fallback)
            queueVotoOffline(categoriaId, candidato);
            return { success: false, queued: true, error };
        }
    }, [queueVotoOffline]);

    /**
     * Synchronizes all pending votes in the background queue.
     */
    const syncPendingVotes = useCallback(async () => {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            const votoOps = queue.filter(op => op.type === 'voto');
            
            if (votoOps.length === 0) return;

            logger.info('sync_started', { count: votoOps.length });

            for (const op of votoOps) {
                try {
                    const { categoriaId, candidato } = op.data;
                    const userId = auth.currentUser.uid;
                    const docRef = doc(db, "resultados_votos", categoriaId, "votes", userId);
                    
                    await setDoc(docRef, {
                        candidato: candidato,
                        timestamp: Date.now()
                    });

                    // Remove from queue after success
                    const currentQueue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
                    const newQueue = currentQueue.filter(q => q.id !== op.id);
                    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
                    
                    setPendingSync(prev => Math.max(0, prev - 1));
                } catch (e) {
                    logger.error('Error sincronizando voto individual', e, { opId: op.id });
                    // We keep it in the queue for next attempt
                }
            }
            
            logger.info('sync_completed');
        } catch (e) {
            logger.error('Error general en sincronización', e);
        }
    }, []);

    return { votos, emitirVoto, pendingSync, syncPendingVotes };
};