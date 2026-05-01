import { useState, useEffect } from 'react';
import { db } from '../../../services/firebase/db';
import { doc, setDoc, onSnapshot, collection, getDocs, writeBatch } from 'firebase/firestore';

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
            await setDoc(doc(db, "configuracion", "estado_votacion"), { 
                [catId]: !isCurrentActive,
                [`${catId}_version`]: !isCurrentActive ? Date.now() : votacionActiva[`${catId}_version`]
            }, { merge: true });
            
            if (!isCurrentActive) {
                // Se acaba de abrir la votación: borramos los shards acumulados en Firebase
                const shardsRef = collection(db, "resultados_votos", catId, "shards");
                const snapshot = await getDocs(shardsRef);
                const batch = writeBatch(db);
                snapshot.forEach(d => {
                    batch.delete(d.ref);
                });
                await batch.commit();
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
