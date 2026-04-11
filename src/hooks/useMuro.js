import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

export const useMuro = () => {
    const [progreso, setProgreso] = useState(false);
    const [fotos, setFotos] = useState([]);

    const CLOUD_NAME = "dhei8pslj";
    const UPLOAD_PRESET = "fotos_xv";

    useEffect(() => {
        const q = query(collection(db, "fotos_muro"), orderBy("timestamp", "desc"), limit(50));
        const unsub = onSnapshot(q, (snap) => {
            setFotos(snap.docs.map(document => ({ id: document.id, ...document.data() })));
        });
        return () => unsub();
    }, []);

    const handleSubir = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProgreso(true);

        try {
            const options = {
                maxSizeMB: 1, 
                maxWidthOrHeight: 1280, 
                useWebWorker: true,
                fileType: 'image/jpeg'
            };
            const compressedFile = await imageCompression(file, options);

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', UPLOAD_PRESET);

            const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await resp.json();

            if (data.secure_url) {
                await addDoc(collection(db, "fotos_muro"), {
                    url: data.secure_url,
                    timestamp: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Error al subir:", error);
            alert("Error al subir la foto.");
        } finally {
            setProgreso(false);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que querés borrar esta foto?")) {
            try {
                await deleteDoc(doc(db, "fotos_muro", id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al eliminar la foto.");
            }
        }
    };

    return {
        fotos,
        progreso,
        handleSubir,
        handleEliminar
    };
};
