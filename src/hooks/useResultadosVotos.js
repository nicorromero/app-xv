import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, onSnapshot, doc, setDoc, increment } from 'firebase/firestore';

export const useResultadosVotos = () => {
    const [votos, setVotos] = useState({});

    useEffect(() => {
        const unsubVotos = onSnapshot(collection(db, "resultados_votos"), (snap) => {
            const counts = {};
            snap.forEach(document => {
                counts[document.id] = document.data();
            });
            setVotos(counts);
        });
        return () => unsubVotos();
    }, []);

    // Helper for anyone that needs to vote
    const emitirVoto = async (categoriaId, candidato) => {
        localStorage.setItem(`voto_${categoriaId}`, 'true');
        const docRef = doc(db, "resultados_votos", categoriaId);
        
        try {
            await setDoc(docRef, {
                [candidato]: increment(1)
            }, { merge: true });
        } catch (error) {
            console.error("Error al emitir voto:", error);
        }
    };

    return { votos, emitirVoto };
};
