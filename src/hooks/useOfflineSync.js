import { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

const QUEUE_KEY = 'offline_sync_queue';
const VOTES_KEY = 'pending_votes';

export const useOfflineSync = () => {
    const isOnline = useOnlineStatus();
    const [pendingCount, setPendingCount] = useState(() => {
        try {
            const queue = localStorage.getItem(QUEUE_KEY);
            return queue ? JSON.parse(queue).length : 0;
        } catch {
            return 0;
        }
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const syncAttempted = useRef(false);

    // Leer cola del localStorage
    const getQueue = useCallback(() => {
        try {
            const queue = localStorage.getItem(QUEUE_KEY);
            return queue ? JSON.parse(queue) : [];
        } catch {
            return [];
        }
    }, []);

    // Guardar cola en localStorage
    const saveQueue = useCallback((queue) => {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        setPendingCount(queue.length);
    }, []);

    // Agregar operación a la cola
    const queueOperation = useCallback((type, data) => {
        const queue = getQueue();
        const operation = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            timestamp: Date.now(),
            attempts: 0
        };
        queue.push(operation);
        saveQueue(queue);
        return operation.id;
    }, [getQueue, saveQueue]);

    // Remover operación de la cola
    const removeOperation = useCallback((operationId) => {
        const queue = getQueue().filter(op => op.id !== operationId);
        saveQueue(queue);
    }, [getQueue, saveQueue]);

    // Guardar voto pendiente (para mostrar UI de "voto guardado")
    const savePendingVote = useCallback((categoriaId, candidato) => {
        try {
            const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
            votes[categoriaId] = { candidato, timestamp: Date.now() };
            localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
        } catch (e) {
            console.error('Error guardando voto pendiente:', e);
        }
    }, []);

    // Verificar si hay voto pendiente para una categoría
    const hasPendingVote = useCallback((categoriaId) => {
        try {
            const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
            return !!votes[categoriaId];
        } catch {
            return false;
        }
    }, []);

    // Marcar categoría como votada (cuando se sincroniza)
    const markVoted = useCallback((categoriaId) => {
        localStorage.setItem(`voto_${categoriaId}`, 'true');
        try {
            const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
            delete votes[categoriaId];
            localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
        } catch (e) {
            console.error('Error limpiando voto pendiente:', e);
        }
    }, []);

    // Sincronizar cola pendiente
    const syncQueue = useCallback(async (syncHandlers) => {
        if (!isOnline || isSyncing) return;
        
        const queue = getQueue();
        if (queue.length === 0) return;

        setIsSyncing(true);
        
        for (const operation of queue) {
            try {
                if (operation.type === 'voto' && syncHandlers.onVoto) {
                    await syncHandlers.onVoto(operation.data);
                    markVoted(operation.data.categoriaId);
                } else if (operation.type === 'pedido_dj' && syncHandlers.onPedidoDj) {
                    await syncHandlers.onPedidoDj(operation.data);
                }
                removeOperation(operation.id);
            } catch (error) {
                console.error(`Error sincronizando operación ${operation.id}:`, error);
                // Incrementar intentos, si falla mucho la dejamos
                const updatedQueue = getQueue().map(op => 
                    op.id === operation.id 
                        ? { ...op, attempts: op.attempts + 1 }
                        : op
                ).filter(op => op.attempts < 5);
                saveQueue(updatedQueue);
            }
        }
        
        setIsSyncing(false);
    }, [isOnline, isSyncing, getQueue, saveQueue, removeOperation, markVoted]);

    // Sincronizar automáticamente al volver online
    useEffect(() => {
        if (isOnline && !syncAttempted.current) {
            syncAttempted.current = true;
            // Dar tiempo a que Firebase se reconecte
            const timer = setTimeout(() => {
                syncQueue({
                    onVoto: async (data) => {
                        const { emitirVoto } = await import('./useResultadosVotos');
                        // Este es un placeholder - la sincronización real se hace desde el componente
                    }
                });
            }, 2000);
            return () => clearTimeout(timer);
        } else if (!isOnline) {
            syncAttempted.current = false;
        }
    }, [isOnline, syncQueue]);



    return {
        queueOperation,
        syncQueue,
        pendingCount,
        isSyncing,
        hasPendingVote,
        savePendingVote,
        markVoted,
        getQueue
    };
};
