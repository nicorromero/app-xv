import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../services/firebase/db';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

const QUEUE_KEY = 'offline_sync_queue';
const PENDING_PEDIDOS_KEY = 'pending_pedidos_dj';

export const usePedidosDj = () => {
    const [pedidos, setPedidos] = useState([]);
    const [nuevaCancion, setNuevaCancion] = useState({ nombre: '', artista: '' });
    const [pendingCount, setPendingCount] = useState(0);

    // Cargar pedidos locales pendientes
    useEffect(() => {
        const loadPending = () => {
            try {
                const pending = JSON.parse(localStorage.getItem(PENDING_PEDIDOS_KEY) || '[]');
                setPendingCount(pending.length);
            } catch {
                setPendingCount(0);
            }
        };
        loadPending();
    }, []);

    useEffect(() => {
        const qDj = query(collection(db, "pedidos_dj"), orderBy("timestamp", "desc"));
        const unsubDj = onSnapshot(qDj, (snap) => {
            setPedidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubDj();
    }, []);

    // Agregar pedido a cola offline
    const queuePedidoOffline = useCallback((nombre, artista) => {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            queue.push({
                id: `pedido_dj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'pedido_dj',
                data: { nombre, artista },
                timestamp: Date.now(),
                attempts: 0
            });
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

            // Guardar en pending local para mostrar
            const pending = JSON.parse(localStorage.getItem(PENDING_PEDIDOS_KEY) || '[]');
            pending.unshift({ nombre, artista, timestamp: Date.now(), id: `local_${Date.now()}` });
            localStorage.setItem(PENDING_PEDIDOS_KEY, JSON.stringify(pending.slice(0, 20))); // Máx 20
            
            setPendingCount(pending.length);
        } catch (e) {
            console.error('Error encolando pedido:', e);
        }
    }, []);

    const enviarPedido = useCallback(async (e, isOnline = true) => {
        e.preventDefault();
        const nombre = nuevaCancion.nombre.trim();
        const artista = nuevaCancion.artista.trim();
        
        if (!nombre) return { success: false, error: 'Nombre requerido' };

        // Reset form inmediatamente para UX
        setNuevaCancion({ nombre: '', artista: '' });
        
        if (!isOnline) {
            queuePedidoOffline(nombre, artista);
            return { success: false, queued: true };
        }
        
        try {
            await addDoc(collection(db, "pedidos_dj"), {
                nombre: nombre.substring(0, 50),
                artista: artista.substring(0, 50),
                timestamp: serverTimestamp()
            });
            return { success: true, queued: false };
        } catch (error) {
            console.error("Error enviando pedido:", error);
            queuePedidoOffline(nombre, artista);
            return { success: false, queued: true, error };
        }
    }, [nuevaCancion, queuePedidoOffline]);

    // Sincronizar pedidos pendientes
    const syncPendingPedidos = useCallback(async () => {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            const pedidoOps = queue.filter(op => op.type === 'pedido_dj');
            
            for (const op of pedidoOps) {
                try {
                    const { nombre, artista } = op.data;
                    await addDoc(collection(db, "pedidos_dj"), {
                        nombre: nombre.substring(0, 50),
                        artista: artista.substring(0, 50),
                        timestamp: serverTimestamp()
                    });
                    
                    // Remover de la cola
                    const newQueue = queue.filter(q => q.id !== op.id);
                    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
                } catch (e) {
                    console.error('Error sincronizando pedido:', e);
                }
            }
            
            // Limpiar pendientes locales
            localStorage.setItem(PENDING_PEDIDOS_KEY, '[]');
            setPendingCount(0);
        } catch (e) {
            console.error('Error en sync de pedidos:', e);
        }
    }, []);

    // Combinar pedidos de Firestore + locales pendientes
    const allPedidos = useCallback(() => {
        try {
            const pending = JSON.parse(localStorage.getItem(PENDING_PEDIDOS_KEY) || '[]');
            return [...pending.map(p => ({ ...p, isLocal: true })), ...pedidos];
        } catch {
            return pedidos;
        }
    }, [pedidos]);

    const borrarPedido = useCallback(async (id) => {
        try {
            await deleteDoc(doc(db, "pedidos_dj", id));
            return { success: true };
        } catch (error) {
            console.error("Error al borrar pedido:", error);
            return { success: false, error };
        }
    }, []);

    return {
        pedidos,
        allPedidos: allPedidos(),
        nuevaCancion,
        setNuevaCancion,
        enviarPedido,
        borrarPedido,
        pendingCount,
        syncPendingPedidos
    };
};
