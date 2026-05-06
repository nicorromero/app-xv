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
            
            if (!isCurrentActive) {
                const estadoRef = doc(db, "configuracion", "estado_votacion");
                
                // Construimos un nuevo estado donde todas están cerradas
                const nuevoEstado = { ...votacionActiva };
                Object.keys(nuevoEstado).forEach(key => {
                    if (!key.endsWith('_version')) {
                        nuevoEstado[key] = false;
                    }
                });
                
                // Abrimos la seleccionada
                nuevoEstado[catId] = true;
                nuevoEstado[`${catId}_version`] = Date.now();

                // Borramos los votos acumulados en chunks de 400 (límite Firestore es 500)
                const votesRef = collection(db, "resultados_votos", catId, "votes");
                const snapshot = await getDocs(votesRef);
                const docs = snapshot.docs;
                
                if (docs.length > 0) {
                    for (let i = 0; i < docs.length; i += 400) {
                        const chunkBatch = writeBatch(db);
                        // El cambio de estado lo metemos solo en el primer batch
                        if (i === 0) chunkBatch.set(estadoRef, nuevoEstado, { merge: true });
                        
                        docs.slice(i, i + 400).forEach(d => chunkBatch.delete(d.ref));
                        await chunkBatch.commit();
                    }
                } else {
                    const batch = writeBatch(db);
                    batch.set(estadoRef, nuevoEstado, { merge: true });
                    await batch.commit();
                }
            } else {
                // Solo la cerramos
                await setDoc(doc(db, "configuracion", "estado_votacion"), { 
                    [catId]: false 
                }, { merge: true });
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
