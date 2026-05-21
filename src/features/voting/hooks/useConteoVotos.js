import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../services/firebase/db';
import { logger } from '../../../services/firebase/logger';

/**
 * Hook de polling para el ProyectorView.
 *
 * Estrategia: getCountFromServer() por candidato cada `intervalMs`.
 * - Una consulta count() cuesta 1 lectura (independientemente de cuántos docs haya).
 * - Con 4 candidatos y polling cada 5s: 4 lecturas * 12/min = 48 lecturas/min.
 * - Sin riesgo de 250K lecturas que generaría un onSnapshot de la subcolección completa.
 *
 * Garantías anti-memory-leak:
 * - El clearInterval vive en el cleanup del useEffect.
 * - Un ref `isMounted` evita setState después del desmontaje (race condition entre
 *   el último fetch y el unmount durante transiciones de estado en ProyectorView).
 * - El intervalo se cancela y recrea si cambian categoriaId o candidatos,
 *   evitando timers huérfanos de renders anteriores.
 *
 * @param {string|null} categoriaId   - ID de la categoría activa
 * @param {string[]}    candidatos    - Array de nombres de candidatos
 * @param {number}      intervalMs    - Período de polling en ms (default: 5000)
 * @returns {{ conteos: Object, lastUpdated: Date|null, isLoading: boolean }}
 */
export const useConteoVotos = (categoriaId, candidatos = [], intervalMs = 5000) => {
    const [conteos, setConteos]         = useState({});
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoading, setIsLoading]     = useState(false);

    // Ref para evitar setState tras unmount
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchConteos = useCallback(async () => {
        // Guardia: sin datos suficientes para consultar
        if (!categoriaId || candidatos.length === 0) return;

        try {
            // Una Promise.all dispara todas las consultas en paralelo.
            // Cada getCountFromServer() = 1 lectura de Firestore (no N lecturas de documentos).
            const resultados = await Promise.all(
                candidatos.map(async (nombre) => {
                    const q = query(
                        collection(db, 'resultados_votos', categoriaId, 'votes'),
                        where('candidato', '==', nombre)
                    );
                    const snap = await getCountFromServer(q);
                    return { nombre, count: snap.data().count };
                })
            );

            if (!isMounted.current) return; // evitar setState si se desmontó durante el fetch

            const nuevosConteos = {};
            resultados.forEach(({ nombre, count }) => {
                nuevosConteos[nombre] = count;
            });

            setConteos(nuevosConteos);
            setLastUpdated(new Date());
        } catch (err) {
            // No relanzar: un error de red en el proyector no debe crashear la pantalla
            logger.error('useConteoVotos: error en fetch', err, { categoriaId });
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [categoriaId, candidatos]);

    useEffect(() => {
        // Limpiar conteos viejos al cambiar de categoría
        setConteos({});
        setLastUpdated(null);

        if (!categoriaId || candidatos.length === 0) return;

        // Fetch inmediato al montar o cuando cambia la categoría
        setIsLoading(true);
        fetchConteos();

        // Intervalo de polling: se limpia automáticamente en el cleanup
        const intervalId = setInterval(fetchConteos, intervalMs);

        return () => {
            clearInterval(intervalId);
            // No cancelamos fetchConteos en vuelo: el ref isMounted evita el setState
        };

    // candidatos es un array — usamos JSON.stringify para evitar re-renders por referencia nueva
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriaId, JSON.stringify(candidatos), intervalMs, fetchConteos]);

    return { conteos, lastUpdated, isLoading };
};
