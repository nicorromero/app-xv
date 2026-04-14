import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig'; // Asegúrate de importar auth
import { collection, onSnapshot, doc, setDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Importante para detectar la sesión

export const useResultadosVotos = () => {
    const [votos, setVotos] = useState({});

    useEffect(() => {
        // Escuchamos el cambio de estado de auth antes de suscribirnos a Firestore
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const unsubVotos = onSnapshot(collection(db, "resultados_votos"), (snap) => {
                    const counts = {};
                    snap.forEach(document => {
                        counts[document.id] = document.data();
                    });
                    setVotos(counts);
                });
                return () => unsubVotos();
            }
        });

        return () => unsubscribeAuth();
    }, []);

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