import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../services/firebase/db';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export const useCategorias = (modo = 'client') => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategorias = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "categorias_votacion"));
            const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategorias(cats);
        } catch (error) {
            console.error("Error fetching categorias:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Listener en tiempo real para TODOS los modos (client, admin, proyector).
    // La colección categorias_votacion tiene ~5 documentos, así que el costo
    // de onSnapshot es despreciable (~5 lecturas por cambio de estado).
    // Antes, modo 'client' usaba getDocs (lectura única) y los celulares
    // nunca se enteraban de que el admin abrió/modificó una categoría.
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "categorias_votacion"), (snap) => {
            const cats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategorias(cats);
            setLoading(false);
        }, (error) => {
            console.error("Error en onSnapshot de categorias:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // ---- FUNCIONES ADMIN ----
    const adminCrearCategoria = async (id, titulo) => {
        try {
            await setDoc(doc(db, "categorias_votacion", id), {
                id,
                titulo,
                candidatos: []
            });
            console.log("Categoría creada exitosamente:", id);
            alert("¡Categoría creada con éxito!");
        } catch (error) {
            console.error("Error creando categoría:", error);
            alert("Error creando categoría: " + error.message);
        }
    };

    const adminActualizarCandidatos = async (categoriaId, nuevosCandidatos) => {
        try {
            await updateDoc(doc(db, "categorias_votacion", categoriaId), {
                candidatos: nuevosCandidatos
            });
        } catch (error) {
            console.error("Error actualizando candidatos:", error);
        }
    };

    const adminEliminarCategoria = async (categoriaId) => {
        try {
            if (window.confirm("¿Seguro que deseas eliminar esta categoría entera?")) {
                await deleteDoc(doc(db, "categorias_votacion", categoriaId));
            }
        } catch (error) {
            console.error("Error eliminando categoría:", error);
        }
    };

    return {
        categorias,
        loading,
        fetchCategorias,
        adminCrearCategoria,
        adminActualizarCandidatos,
        adminEliminarCategoria
    };
};
