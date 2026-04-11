import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const AdminTrigger = ({ children }) => {
    const { isAdmin } = useAuth();
    const [clickCount, setClickCount] = useState(0);
    const [showLogin, setShowLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        if (isAdmin || showLogin) return; // Si ya es admin o ya está el form, no hacer nada
        
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= 3) {
            setClickCount(0);
            setShowLogin(true);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowLogin(false);
            setEmail('');
            setPassword('');
        } catch (err) {
            console.error(err);
            setError('Credenciales incorrectas o usuario no existe');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            setError('Llená el email y contraseña primero');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            await createUserWithEmailAndPassword(auth, email, password);
            setShowLogin(false);
            setEmail('');
            setPassword('');
            alert('¡Usuario creado y logueado exitosamente!');
        } catch (err) {
            console.error(err);
            setError('Error al crear usuario: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div 
                onClick={handleClick} 
                style={{ display: 'inline-block', cursor: isAdmin ? 'pointer' : 'default' }}
                title=""
            >
                {children}
            </div>

            {showLogin && !isAdmin && (
                <div style={overlayStyle}>
                    <form onSubmit={handleLogin} style={formStyle}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e0218a', fontSize: '16px' }}>Acceso Admin</h3>
                        {error && <p style={{ color: 'red', fontSize: '11px', margin: '0 0 10px 0' }}>{error}</p>}
                        
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                            required
                        />
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                            required
                        />
                        
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <button type="button" onClick={() => setShowLogin(false)} style={btnCancel}>Cancelar</button>
                            <button type="submit" style={btnSubmit} disabled={loading}>
                                {loading ? '...' : 'Entrar'}
                            </button>
                        </div>
                        
                        {/* BOTÓN TEMPORAL PARA CREAR LA CUENTA */}
                        <button 
                            type="button" 
                            onClick={handleRegister} 
                            style={{...btnCancel, borderColor: '#e0218a', color: '#e0218a', fontSize: '12px'}}
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : '⚠️ Temp: Crear Admin'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// Estilos
const overlayStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '10px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    padding: '20px',
    borderRadius: '15px',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '200px'
};

const inputStyle = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#222',
    color: 'white',
    outline: 'none'
};

const btnCancel = {
    flex: 1,
    padding: '8px',
    background: 'transparent',
    border: '1px solid #555',
    color: '#ccc',
    borderRadius: '8px',
    cursor: 'pointer'
};

const btnSubmit = {
    flex: 1,
    padding: '8px',
    background: '#e0218a',
    border: 'none',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

export default AdminTrigger;
