import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../services/firebase/db';
import { doc, setDoc, onSnapshot, collection, getDocs, writeBatch } from 'firebase/firestore';

export const useVotaciones = () => {
    const [votacionActiva, setVotacionActiva] = useState({});

    // Escuchar el estado de apertura/cierre/preview de la votación
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

    // Limpia los votos anteriores de una categoría
    const limpiarVotosCategoria = async (catId) => {
        const votesRef = collection(db, "resultados_votos", catId, "votes");
        const snapshot = await getDocs(votesRef);
        const docs = snapshot.docs;
        if (docs.length > 0) {
            for (let i = 0; i < docs.length; i += 400) {
                const chunkBatch = writeBatch(db);
                docs.slice(i, i + 400).forEach(d => chunkBatch.delete(d.ref));
                await chunkBatch.commit();
            }
        }
    };

    /**
     * Pone una categoría en estado 'preview':
     * - En el proyector: se muestra la categoría y sus nominados con votos en 0.
     * - En los celulares: se fuerza la vista a los nominados pero con votación bloqueada.
     * - Limpia los votos acumulados de la ronda previa para dejar la urna lista.
     */
    const previewCategoria = useCallback(async (catId) => {
        try {
            const estadoRef = doc(db, "configuracion", "estado_votacion");
            const nuevoEstado = { ...votacionActiva };
            // Cerrar todas las demás
            Object.keys(nuevoEstado).forEach(key => {
                if (!key.endsWith('_version')) {
                    nuevoEstado[key] = false;
                }
            });

            nuevoEstado[catId] = 'preview';
            nuevoEstado[`${catId}_version`] = Date.now();

            await limpiarVotosCategoria(catId);
            await setDoc(estadoRef, nuevoEstado, { merge: true });
        } catch (e) {
            console.error("Error al poner categoría en preview:", e);
        }
    }, [votacionActiva]);

    /**
     * Abre la votación formalmente para recibir votos:
     * - Desbloquea los botones de voto en los celulares al instante.
     * - El proyector empieza a contar en vivo.
     */
    const abrirCategoria = useCallback(async (catId) => {
        try {
            const estadoRef = doc(db, "configuracion", "estado_votacion");
            const nuevoEstado = { ...votacionActiva };

            // Cerrar todas las demás
            Object.keys(nuevoEstado).forEach(key => {
                if (!key.endsWith('_version') && key !== catId) {
                    nuevoEstado[key] = false;
                }
            });

            // Si no venía de 'preview', limpiamos votos y generamos nueva version
            if (votacionActiva[catId] !== 'preview') {
                nuevoEstado[`${catId}_version`] = Date.now();
                await limpiarVotosCategoria(catId);
            }

            nuevoEstado[catId] = true;
            await setDoc(estadoRef, nuevoEstado, { merge: true });
        } catch (e) {
            console.error("Error al abrir categoría:", e);
        }
    }, [votacionActiva]);

    /**
     * Cierra la categoría activa (pasa a celebración o espera).
     */
    const cerrarCategoria = useCallback(async (catId) => {
        try {
            await setDoc(doc(db, "configuracion", "estado_votacion"), { 
                [catId]: false 
            }, { merge: true });
        } catch (e) {
            console.error("Error al cerrar categoría:", e);
        }
    }, []);

    /**
     * Alterna estado (compatibilidad).
     * Si está cerrada -> preview.
     * Si está en preview -> abrir.
     * Si está abierta -> cerrar.
     */
    const toggleCategoria = useCallback(async (catId) => {
        const estado = votacionActiva[catId];
        if (!estado || estado === false) {
            await previewCategoria(catId);
        } else if (estado === 'preview') {
            await abrirCategoria(catId);
        } else {
            await cerrarCategoria(catId);
        }
    }, [votacionActiva, previewCategoria, abrirCategoria, cerrarCategoria]);

    return {
        votacionActiva,
        previewCategoria,
        abrirCategoria,
        cerrarCategoria,
        toggleCategoria
    };
};
