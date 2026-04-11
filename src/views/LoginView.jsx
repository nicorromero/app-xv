import React, { useState } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const LoginView = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const saveGuestProfile = async (user, displayName) => {
        const docRef = doc(db, 'invitados', user.uid);
        await setDoc(docRef, {
            nombre: displayName || user.email.split('@')[0],
            email: user.email,
            ultimoAcceso: serverTimestamp()
        }, { merge: true });
    };

    const handleGoogle = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await saveGuestProfile(result.user, result.user.displayName);
        } catch (error) {
            console.error(error);
            setError("Error al ingresar con Google. Verifica tu conexión.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegistering) {
                if (!nombre.trim()) {
                    throw new Error("Por favor ingresa tu nombre y apellido");
                }
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: nombre });
                await saveGuestProfile(result.user, nombre);
            } else {
                const result = await signInWithEmailAndPassword(auth, email, password);
                // También actualizamos ultimoAcceso
                await saveGuestProfile(result.user, result.user.displayName);
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                setError("El email ya está registrado. Intenta Iniciar Sesión.");
            } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setError("Credenciales incorrectas.");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Ingreso Exclusivo</h1>
                <p style={{ color: '#ccc', marginBottom: '30px' }}>
                    Solo los invitados confirmados pueden acceder a las fotos, el DJ y las votaciones de la noche.
                </p>

                {error && <div style={errorStyle}>{error}</div>}

                <button onClick={handleGoogle} style={googleBtnStyle} disabled={loading}>
                    {loading ? '...' : '✨ Entrar con Google'}
                </button>

                <div style={dividerStyle}>
                    <span style={{ backgroundColor: '#1a1a1a', padding: '0 10px', color: '#777' }}>O usar Email</span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {isRegistering && (
                        <input 
                            type="text" 
                            placeholder="Nombre y Apellido" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            style={inputStyle} 
                            required 
                        />
                    )}
                    <input 
                        type="email" 
                        placeholder="tu@email.com" 
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

                    <button type="submit" style={submitBtnStyle} disabled={loading}>
                        {loading ? 'Cargando...' : (isRegistering ? 'Confirmar Asistencia' : 'Iniciar Sesión')}
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
                    {isRegistering ? '¿Ya confirmaste?' : '¿Sos nuevo?'} 
                    <span 
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
                        style={{ color: '#e0218a', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                    >
                        {isRegistering ? 'Iniciá Sesión acá' : 'Registrate acá'}
                    </span>
                </p>
            </div>
        </div>
    );
};

const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(-45deg, #0f0f0f, #1a001a, #0f0f0f, #2d0036)',
    backgroundSize: '400% 400%',
    animation: 'gradientBG 15s ease infinite',
    fontFamily: 'sans-serif'
};

const cardStyle = {
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(224, 33, 138, 0.3)',
    borderRadius: '25px',
    padding: '50px 40px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    animation: 'neonGlow 3s infinite alternate'
};

const titleStyle = {
    color: '#fff',
    margin: '0 0 10px 0',
    fontSize: '32px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 0 10px #e0218a, 0 0 20px #e0218a, 0 0 40px #e0218a'
};

const inputStyle = {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(224, 33, 138, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    outline: 'none',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
};

const submitBtnStyle = {
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#e0218a',
    color: 'white',
    fontWeight: '900',
    fontSize: '18px',
    cursor: 'pointer',
    marginTop: '15px',
    boxShadow: '0 0 15px rgba(224, 33, 138, 0.6)',
    transition: 'transform 0.2s, box-shadow 0.2s'
};

const googleBtnStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid transparent',
    backgroundColor: 'white',
    color: '#1a1a1a',
    fontWeight: '900',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(255,255,255,0.2)'
};

const dividerStyle = {
    margin: '35px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    lineHeight: '0.1em',
    textAlign: 'center'
};

const errorStyle = {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: '#ff6b6b',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ff6b6b',
    marginBottom: '25px',
    fontSize: '14px',
    fontWeight: 'bold'
};

// Inyectar animaciones globales dinámicamente
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes neonGlow {
    0% { box-shadow: 0 0 15px rgba(224,33,138,0.2), inset 0 0 10px rgba(224,33,138,0.1) }
    100% { box-shadow: 0 0 35px rgba(224,33,138,0.6), inset 0 0 20px rgba(224,33,138,0.3) }
  }
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  input:focus {
    border-color: #ffb3ff !important;
    box-shadow: 0 0 15px rgba(255, 179, 255, 0.5) !important;
  }
  button:hover {
    transform: translateY(-2px);
  }
`;
if (typeof document !== 'undefined') {
    document.head.appendChild(styleSheet);
}

export default LoginView;
