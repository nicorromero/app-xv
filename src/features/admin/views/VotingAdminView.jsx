import { useState } from 'react';
import { Star, Camera, Loader2, Plus, Trash2, FlaskConical } from 'lucide-react';
import { useCategorias } from '../../voting/hooks/useCategorias';
import imageCompression from 'browser-image-compression';
import { perf } from '../../../services/firebase/app';
import { trace as traceMetric } from 'firebase/performance';
import { useStressTest } from '../hooks/useStressTest';

export default function VotingAdminView() {
    const { categorias, loading, adminCrearCategoria, adminActualizarCandidatos, adminEliminarCategoria } = useCategorias('admin');
    
    const [nuevaCatId, setNuevaCatId] = useState('');
    const [nuevaCatTitulo, setNuevaCatTitulo] = useState('');
    
    // Uploads
    const [uploadingUrlPara, setUploadingUrlPara] = useState(null);
    const { running: stressRunning, progress: stressProgress, total: stressTotal, ejecutar: ejecutarStressTest } = useStressTest();
    const CLOUD_NAME = "dhei8pslj";
    const UPLOAD_PRESET = "fotos_xv";

    const handleCrearCategoria = (e) => {
        e.preventDefault();
        if (!nuevaCatId || !nuevaCatTitulo) return;
        const idFormateado = nuevaCatId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        adminCrearCategoria(idFormateado, nuevaCatTitulo);
        setNuevaCatId('');
        setNuevaCatTitulo('');
    };

    const handleAddCandidato = (cat) => {
        const nombre = prompt("Nombre del candidato:");
        if (!nombre) return;
        const nuevos = [...(cat.candidatos || []), { nombre, photoUrl: '' }];
        adminActualizarCandidatos(cat.id, nuevos);
    };

    const handleEliminarCandidato = (cat, indexToRemove) => {
        if (!window.confirm("¿Borrar candidato?")) return;
        const nuevos = cat.candidatos.filter((_, i) => i !== indexToRemove);
        adminActualizarCandidatos(cat.id, nuevos);
    };

    const handleSubirFotoCandidato = async (file, cat, candidatoIndex) => {
        if (!file) return;
        setUploadingUrlPara({ catId: cat.id, cIndex: candidatoIndex });

        const uploadTrace = traceMetric(perf, "upload_foto_invitado");
        uploadTrace.start();

        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/jpeg' };
            const compressedFile = await imageCompression(file, options);

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', UPLOAD_PRESET);

            const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await resp.json();
            uploadTrace.stop(); // Termina al recibir la URL

            if (data.secure_url) {
                // Actualizar DB con URL
                const nuevos = [...cat.candidatos];
                nuevos[candidatoIndex].photoUrl = data.secure_url;
                await adminActualizarCandidatos(cat.id, nuevos);
            }
        } catch (error) {
            console.error(error);
            uploadTrace.stop(); // Por si hay un error
            alert("Error subiendo foto.");
        } finally {
            setUploadingUrlPara(null);
        }
    };

    if (loading) return <div style={styles.container}><Loader2 className="spin" color="#ffffff" /></div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Star style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                <h2 style={styles.title}>CMS de Votaciones</h2>
                <p style={styles.subtitle}>Configura nominados y fotos</p>
            </div>

            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Crear Categoría</h3>
                <form onSubmit={handleCrearCategoria} style={styles.formContainer}>
                    <input 
                        style={styles.input} 
                        placeholder="ID ej: el_mas_loco" 
                        value={nuevaCatId} 
                        onChange={(e) => setNuevaCatId(e.target.value)} 
                    />
                    <input 
                        style={styles.input} 
                        placeholder="Título ej: El más loco" 
                        value={nuevaCatTitulo} 
                        onChange={(e) => setNuevaCatTitulo(e.target.value)} 
                    />
                    <button type="submit" style={styles.btnPrimary}>Añadir</button>
                </form>
            </div>

            <div style={styles.catsContainer}>
                {categorias.map(cat => (
                    <div key={cat.id} style={styles.catCard}>
                        <div style={styles.catHeader}>
                            <h4 style={styles.catTitle}>{cat.titulo} <small style={{color:'grey'}}>({cat.id})</small></h4>
                            <button onClick={() => adminEliminarCategoria(cat.id)} style={styles.btnDeleteText}>Borrar Cat.</button>
                        </div>
                        
                        <div style={styles.candidatosList}>
                            {(cat.candidatos || []).map((c, i) => {
                                const isUploading = uploadingUrlPara?.catId === cat.id && uploadingUrlPara?.cIndex === i;
                                return (
                                    <div key={i} style={styles.candidatoRow}>
                                        <div style={styles.candInfo}>
                                            <div 
                                                style={{...styles.candPhoto, backgroundImage: c.photoUrl ? `url(${c.photoUrl})` : 'none'}}
                                            >
                                                {!c.photoUrl && <Camera size={14} color="rgba(255,255,255,0.4)" />}
                                            </div>
                                            <span style={styles.candName}>{c.nombre}</span>
                                        </div>

                                        <div style={styles.candActions}>
                                            <input 
                                                type="file" 
                                                id={`upload-${cat.id}-${i}`} 
                                                style={{display: 'none'}} 
                                                accept="image/*"
                                                onChange={(e) => handleSubirFotoCandidato(e.target.files[0], cat, i)}
                                            />
                                            <label htmlFor={`upload-${cat.id}-${i}`} style={styles.btnIcon}>
                                                {isUploading ? <Loader2 size={16} className="spin" color="#4A90D9" /> : <Camera size={16} color="#4A90D9" />}
                                            </label>
                                            <button onClick={() => handleEliminarCandidato(cat, i)} style={styles.btnIcon}>
                                                <Trash2 size={16} color="#ff6b6b" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        <button onClick={() => handleAddCandidato(cat)} style={styles.btnAddCand}>
                            <Plus size={14} /> Añadir Nominado
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Stress Test ── */}
            <div style={styles.stressCard}>
                <h3 style={styles.sectionTitle}>🔥 Stress Test de Carga</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 12px 0' }}>
                    Envía 50 votos simulados a la categoría seleccionada y mide el rendimiento en Firebase Performance.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {categorias.map(cat => (
                        <button
                            key={cat.id}
                            disabled={stressRunning}
                            onClick={() => ejecutarStressTest(cat.id, (cat.candidatos || []).map(c => c.nombre))}
                            style={{
                                ...styles.stressBtn,
                                opacity: stressRunning ? 0.6 : 1,
                                cursor: stressRunning ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {stressRunning
                                ? <><Loader2 size={14} className="spin" /> {stressProgress}/{stressTotal} votos enviados...</>
                                : <><FlaskConical size={14} /> 50 votos → {cat.titulo}</>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: '#FFFFFF',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px 16px',
    },
    stressCard: {
        backgroundColor: 'rgba(220, 80, 60, 0.15)',
        border: '1px dashed rgba(220, 80, 60, 0.5)',
        borderRadius: '16px',
        padding: '16px',
        marginTop: '20px',
    },
    stressBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(220, 80, 60, 0.7)',
        border: 'none',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '700',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '13px',
        width: '100%',
        transition: 'opacity 0.2s ease',
    },
    header: { textAlign: 'center', marginBottom: '24px' },
    icon: { width: '48px', height: 'auto', display: 'block', margin: '0 auto 12px auto' },
    title: { fontSize: '22px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFFFFF' },
    subtitle: { fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0 },
    card: {
        backgroundColor: 'rgba(74, 144, 217, 0.15)',
        border: '1px solid rgba(74, 144, 217, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
    },
    sectionTitle: { fontSize: '15px', marginTop: 0, marginBottom: '12px' },
    formContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
    input: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#FFFFFF',
        padding: '10px 12px',
        borderRadius: '8px',
        fontFamily: "'Montserrat', sans-serif",
    },
    btnPrimary: {
        backgroundColor: '#4A90D9',
        border: 'none',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    catsContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
    catCard: {
        backgroundColor: 'rgba(141, 90, 115, 0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '16px',
    },
    catHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    catTitle: { margin: 0, fontSize: '16px' },
    btnDeleteText: { background: 'none', border: 'none', color: '#ff6b6b', fontSize: '12px', cursor: 'pointer' },
    candidatosList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' },
    candidatoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: '8px',
        borderRadius: '8px',
    },
    candInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
    candPhoto: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    candName: { fontSize: '14px' },
    candActions: { display: 'flex', gap: '8px' },
    btnIcon: {
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex'
    },
    btnAddCand: {
        background: 'none',
        border: '1px dashed rgba(255,255,255,0.3)',
        color: 'rgba(255,255,255,0.8)',
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: 'pointer'
    }
};
