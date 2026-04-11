import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

export const usePedidosDj = () => {
    const [pedidos, setPedidos] = useState([]);
    const [nuevaCancion, setNuevaCancion] = useState({ nombre: '', artista: '' });

    useEffect(() => {
        const qDj = query(collection(db, "pedidos_dj"), orderBy("timestamp", "desc"));
        const unsubDj = onSnapshot(qDj, (snap) => {
            setPedidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubDj();
    }, []);

    const enviarPedido = async (e) => {
        e.preventDefault();
        const nombre = nuevaCancion.nombre.trim();
        const artista = nuevaCancion.artista.trim();
        
        if (!nombre) return;
        
        await addDoc(collection(db, "pedidos_dj"), {
            nombre: nombre.substring(0, 50),
            artista: artista.substring(0, 50),
            timestamp: serverTimestamp()
        });
        setNuevaCancion({ nombre: '', artista: '' });
        alert("¡Pedido enviado al DJ!");
    };

    return {
        pedidos,
        nuevaCancion,
        setNuevaCancion,
        enviarPedido
    };
};
