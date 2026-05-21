import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { trace } from 'firebase/performance';
import { db } from '../../../services/firebase/db';
import { perf } from '../../../services/firebase/app';

// 1. Subimos la agresividad a 600 votos para estar sobrados
const TOTAL_VOTOS = 600; 
// 2. Ventana de tiempo (en milisegundos). 
// Todos los votos impactarán aleatoriamente en los próximos 5 segundos.
const VENTANA_DE_TIEMPO_MS = 5000; 

export const useStressTest = () => {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    const ejecutar = async (categoriaId, candidatos = []) => {
        if (!categoriaId) return alert('Seleccioná una categoría válida');
        if (candidatos.length === 0) return alert('La categoría no tiene candidatos cargados');
        
        setRunning(true);
        setProgress(0);
        console.log(`🚀 INICIANDO ESTAMPIDA → ${TOTAL_VOTOS} votos en ${categoriaId}...`);

        const t = trace(perf, 'stress_test_voto_masivo');
        t.start();

        const promesasDeVoto = [];

        // Preparamos los 600 disparos al mismo tiempo
        for (let i = 1; i <= TOTAL_VOTOS; i++) {
            promesasDeVoto.push((async () => {
                // JITTER: Cada voto espera un tiempo aleatorio entre 0 y 5 segundos antes de dispararse.
                // Esto simula el comportamiento humano caótico (Rage Clicking disperso).
                const delayAleatorio = Math.floor(Math.random() * VENTANA_DE_TIEMPO_MS);
                await new Promise(r => setTimeout(r, delayAleatorio));

                const fakeUserId = `stress_simulado_${i}_${Date.now()}`;
                
                // IMPORTANTE: Asegurate de que esta ruta coincida con tu firestore.rules
                const voteRef = doc(db, 'resultados_votos', categoriaId, 'votes', fakeUserId);
                const randomIndex = Math.floor(Math.random() * candidatos.length);
                const candidato = candidatos[randomIndex];
                
                try {
                    await setDoc(voteRef, { 
                        candidato: candidato,
                        timestamp: Date.now(),
                        isStressTest: true
                    });
                    
                    // Actualización funcional del estado para que no se pierdan 
                    // números en la UI por la concurrencia extrema
                    setProgress(prev => prev + 1); 
                } catch (err) {
                    console.error(`❌ Error en voto ${i}:`, err);
                }
            })());
        }

        // Ejecutamos TODAS las promesas en paralelo
        await Promise.all(promesasDeVoto);

        t.stop();
        setRunning(false);
        setProgress(0); // Opcional: Podés dejarlo en TOTAL_VOTOS para ver que terminó
        
        console.log(`✅ ESTAMPIDA FINALIZADA`);
        alert(`✅ Stress Test completado (${TOTAL_VOTOS} votos). Revisá el proyector y Firebase Performance.`);
    };

    return { running, progress, total: TOTAL_VOTOS, ejecutar };
};