import { useState } from 'react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { trace } from 'firebase/performance';
import { db } from '../../../services/firebase/db';
import { perf } from '../../../services/firebase/app';

const TOTAL_VOTOS = 50;
const NUM_SHARDS = 20;

export const useStressTest = () => {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    /**
     * @param {string} categoriaId
     * @param {string[]} candidatos - array de nombres reales de la categoría
     */
    const ejecutar = async (categoriaId, candidatos = []) => {
        if (!categoriaId) return alert('Seleccioná una categoría válida');
        if (candidatos.length === 0) return alert('La categoría no tiene candidatos cargados');
        setRunning(true);
        setProgress(0);
        console.log(`🚀 Stress test → ${categoriaId} con candidatos:`, candidatos);

        const t = trace(perf, 'stress_test_voto_masivo');
        t.start();

        for (let i = 1; i <= TOTAL_VOTOS; i++) {
            try {
                // Escribir como si fuera un usuario único para la nueva arquitectura "Documento por Voto"
                const fakeUserId = `stress_simulado_${i}_${Date.now()}`;
                const voteRef = doc(db, 'resultados_votos', categoriaId, 'votes', fakeUserId);
                // Selección aleatoria para que la carrera sea desigual y se puedan probar los sobrepasos
                const randomIndex = Math.floor(Math.random() * candidatos.length);
                const candidato = candidatos[randomIndex];
                
                await setDoc(voteRef, { 
                    candidato: candidato,
                    timestamp: Date.now(),
                    isStressTest: true
                });
                
                setProgress(i);
            } catch (err) {
                console.error(`❌ Error en voto ${i}:`, err);
            }
            await new Promise(r => setTimeout(r, 80));
        }

        t.stop();
        setRunning(false);
        setProgress(0);
        alert(`✅ Stress Test completado (${TOTAL_VOTOS} votos). Revisá el proyector y Firebase Performance.`);
    };

    return { running, progress, total: TOTAL_VOTOS, ejecutar };
};

