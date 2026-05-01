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
                const batch = writeBatch(db);
                const estadoRef = doc(db, "configuracion", "estado_votacion");
                
                // Construimos un nuevo estado donde todas están cerradas
                const nuevoEstado = { ...votacionActiva };
                Object.keys(nuevoEstado).forEach(key => {
                    // Ponemos en false solo las keys de categorias (no las versiones)
                    if (!key.endsWith('_version')) {
                        nuevoEstado[key] = false;
                    }
                });
                
                // Abrimos la seleccionada
                nuevoEstado[catId] = true;
                nuevoEstado[`${catId}_version`] = Date.now();
                
                batch.set(estadoRef, nuevoEstado, { merge: true });

                // Borramos los shards acumulados de esta categoría
                const shardsRef = collection(db, "resultados_votos", catId, "shards");
                const snapshot = await getDocs(shardsRef);
                snapshot.forEach(d => {
                    batch.delete(d.ref);
                });
                
                // Ejecutamos todo junto
                await batch.commit();
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
