import { useState, useEffect } from 'react';
import { db } from '../../../services/firebase/db';
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

export const useVotaciones = () => {
    const [votacionActiva, setVotacionActiva] = useState({});

    // Escuchar solo el estado de apertura/cierre de la votación
    useEffect(() => {
        const unsubConfig = onSnapshot(doc(db, "configuracion", "estado_votacion"), (snapshot) => {
            if (snapshot.exists()) {
                setVotacionActiva(snapshot.data());
            } else {
                setVotacionActiva({});
            }
        });
        return () => unsubConfig();
    }, []);

    const toggleCategoria = async (catId) => {
        try {
            const isCurrentActive = votacionActiva[catId] === true;
            await setDoc(doc(db, "configuracion", "estado_votacion"), { [catId]: !isCurrentActive }, { merge: true });
            
            if (!isCurrentActive) {
                // Se acaba de abrir la votación: borramos los votos acumulados en Firebse
                await deleteDoc(doc(db, "resultados_votos", catId));
            }
        } catch (e) {
            console.error("Error cambiando estado:", e);
        }
    };

    return {
        votacionActiva,
        toggleCategoria
    };
};
