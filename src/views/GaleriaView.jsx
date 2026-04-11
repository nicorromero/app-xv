import React from 'react';
import AdminTrigger from '../components/AdminTrigger';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useMuro } from '../hooks/useMuro';
import { getOptimizedUrl } from '../utils/cloudinaryUtils';

const GaleriaView = () => {
    const { isAdmin } = useAuth();
    const isOnline = useOnlineStatus();
    const { fotos, progreso, handleSubir, handleEliminar } = useMuro();

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '0 4px', textAlign: 'center' }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <AdminTrigger>
                    <h2 style={{ color: '#e0218a', margin: 0 }}>Muro de Fotos</h2>
                </AdminTrigger>

                <input 
                    type="file" 
                    accept="image/*" 
                    id="upload-btn" 
                    onChange={handleSubir} 
                    style={{ display: 'none' }} 
                    disabled={!isOnline} 
                />
                
                <label 
                    htmlFor={isOnline ? "upload-btn" : ""} 
                    style={{ 
                        ...btnEstilo, 
                        margin: 0, 
                        backgroundColor: isOnline ? '#e0218a' : '#555', 
                        cursor: isOnline ? 'pointer' : 'not-allowed',
                        opacity: isOnline ? 1 : 0.6
                    }}
                >
                    {progreso ? "Subiendo... " : (!isOnline ? "Sin conexión para subir" : "Subir una Foto ")}
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '30px' }}>
                {fotos.map(f => (
                    <div key={f.id} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
                        <img loading="lazy" src={getOptimizedUrl(f.url)} alt="Foto XV" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                        {isAdmin && (
                            <button
                                onClick={() => handleEliminar(f.id)}
                                style={btnEliminarEstilo}
                            >
                                ✕
                            </button>
                        )}
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

const btnEliminarEstilo = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    border: 'none',
    color: 'white',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 5px rgba(0,0,0,0.5)'
};

export default GaleriaView;
