import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const Galeria = () => {
    const [progreso, setProgreso] = useState(false);
    const [fotos, setFotos] = useState([]);

    // Configuración de Cloudinary (Cambiá esto con tus datos)
    const CLOUD_NAME = "dhei8pslj";
    const UPLOAD_PRESET = "fotos_xv";

    useEffect(() => {
        const q = query(collection(db, "fotos_muro"), orderBy("timestamp", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setFotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const handleSubir = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProgreso(true);

        // 1. Preparamos el "paquete" para Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            // 2. Subimos la foto a Cloudinary
            const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await resp.json();

            if (data.secure_url) {
                // 3. Guardamos el LINK que nos dio Cloudinary en nuestro Firebase
                await addDoc(collection(db, "fotos_muro"), {
                    url: data.secure_url,
                    timestamp: serverTimestamp()
                });
                console.log("Foto guardada en Firebase exitosamente");
            }
        } catch (error) {
            console.error("Error al subir:", error);
            alert("Error al subir la foto.");
        } finally {
            setProgreso(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: '#e0218a' }}>Muro de Fotos</h2>

            <input type="file" accept="image/*" id="upload-btn" onChange={handleSubir} style={{ display: 'none' }} />
            <label htmlFor="upload-btn" style={btnEstilo}>
                {progreso ? "Subiendo... " : "Subir una Foto "}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '30px' }}>
                {fotos.map(f => (
                    <div key={f.id} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                        <img src={f.url} alt="Foto XV" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const btnEstilo = {
    backgroundColor: '#e0218a',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'inline-block',
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(224, 33, 138, 0.5)'
};

export default Galeria;