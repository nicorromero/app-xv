import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- FOTOS DE EJEMPLO PARA LA INVITACIÓN ---
// Sustituye estas URLs por las rutas de las fotos de la quinceañera (ej. '/assets/foto1.jpg')
const backgroundImages = [
    'https://images.unsplash.com/photo-1519225421980-715cb02151ff?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1542361139-4ab558efdf34?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80', // Detalles elegantes / salón
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80', // Sesión de fotos tipo book (chica en vestido)
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1920&q=80', // Luces de fiesta
    'https://images.unsplash.com/photo-1530103862677-de3e5939d8b1?auto=format&fit=crop&w=1920&q=80'  // Detalles premium de mesas y velas
];

const LoginView = () => {
    // Estados de vistas
    const [showForm, setShowForm] = useState(false);

    // Estados del formulario
    const [isRegistering, setIsRegistering] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estados del Carrusel y Cuenta Regresiva
    const [currentBg, setCurrentBg] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

    const fechaEvento = new Date("2026-05-23T21:00:00").getTime();

    // Efecto del carrusel de fondo (cambia cada 3.5s)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Efecto de la cuenta regresiva
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = fechaEvento - now;

            if (distance < 0) {
                setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
                horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                segundos: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [fechaEvento]);

    // ===== LÓGICA DE FIREBASE =====
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
                if (!nombre.trim()) throw new Error("Por favor ingresa tu nombre y apellido");
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: nombre });
                await saveGuestProfile(result.user, nombre);
            } else {
                const result = await signInWithEmailAndPassword(auth, email, password);
                await saveGuestProfile(result.user, result.user.displayName);
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') setError("El email ya está registrado. Intenta Iniciar Sesión.");
            else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') setError("Credenciales incorrectas.");
            else setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ===== RENDERIZADO =====
    return (
        <div style={containerStyle}>
            {/* FONDOS DINÁMICOS */}
            {backgroundImages.map((img, index) => (
                <div
                    key={index}
                    style={{
                        ...bgImageStyle,
                        backgroundImage: `url(${img})`,
                        opacity: currentBg === index ? 1 : 0
                    }}
                />
            ))}

            {/* OVERLAY OSCURO PARA LEER EL TEXTO */}
            <div style={darkOverlay}></div>

            {/* CONTENIDO PRINCIPAL CENTRADO */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>

                {!showForm ? (
                    // VISTA INVITACIÓN VIRTUAL
                    <div style={inviteCardStyle}>
                        <h3 style={subtitleStyle}>Estás invitado a los 15 de</h3>
                        <h1 style={titleStyle}>Sofía</h1> {/* Puedes cambiar "Sofía" por el nombre real */}

                        <p style={quoteStyle}>
                            "Hay momentos en la vida que imaginamos desde que somos pequeños.
                            Hoy quiero que seas parte de la noche más mágica de mi historia."
                        </p>

                        <div style={dateBoxStyle}>
                            23 de Mayo, 2026
                        </div>

                        <div style={countdownContainer}>
                            <div style={timeBox}><span style={timeNum}>{timeLeft.dias}</span> <span style={timeLabel}>Días</span></div>
                            <div style={timeBox}><span style={timeNum}>{timeLeft.horas}</span> <span style={timeLabel}>Hs</span></div>
                            <div style={timeBox}><span style={timeNum}>{timeLeft.minutos}</span> <span style={timeLabel}>Min</span></div>
                            <div style={timeBox}><span style={timeNum}>{timeLeft.segundos}</span> <span style={timeLabel}>Seg</span></div>
                        </div>

                        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>
                            Confirmar Asistencia
                        </button>
                    </div>
                ) : (
                    // VISTA FORMULARIO RSVP
                    <div style={formCardStyle}>
                        <button onClick={() => setShowForm(false)} style={backBtnStyle}>← Volver</button>

                        <h2 style={{ color: '#ffb3ff', marginTop: 0 }}>Reservar mi lugar</h2>
                        <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '14px' }}>
                            Acreditate ahora para entrar al mural, pedir canciones y poder votar durante la fiesta.
                        </p>

                        {error && <div style={errorStyle}>{error}</div>}

                        <button onClick={handleGoogle} style={googleBtnStyle} disabled={loading}>
                            {loading ? '...' : 'Confirmar con Google '}
                        </button>

                        <div style={dividerStyle}>
                            <span style={{ backgroundColor: 'rgba(20, 20, 20, 0)', padding: '0 10px', color: '#aaa', backdropFilter: 'blur(5px)' }}>O usar Email</span>
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
                                placeholder="Contraseña "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            <button type="submit" style={submitBtnStyle} disabled={loading}>
                                {loading ? 'Cargando...' : (isRegistering ? 'Confirmar Presencia' : 'Iniciar Sesión')}
                            </button>
                        </form>

                        <p style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
                            {isRegistering ? '¿Ya estás en la lista?' : '¿Todavía no confirmaste?'}
                            <span
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                style={{ color: '#ffb3ff', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                            >
                                {isRegistering ? 'Iniciá Sesión acá' : 'Confirma acá'}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== ESTILOS ELEGANTES =====

const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflowY: 'auto',
    fontFamily: "'Inter', sans-serif, serif",
    background: 'transparent'
};

const bgImageStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 2s ease-in-out',
    zIndex: 1
};

const darkOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 2,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(224, 33, 138, 0.4) 100%)'
};

const inviteCardStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '500px',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    animation: 'fadeUp 1s ease-out'
};

const subtitleStyle = {
    color: '#ffccff',
    fontSize: '20px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    margin: '0 0 10px 0',
    fontWeight: '300'
};

const titleStyle = {
    color: '#fff',
    fontSize: '80px',
    fontFamily: "'Playfair Display', serif", // Tipografía elegante de invitaciones
    margin: '0 0 20px 0',
    textShadow: '0 0 20px #e0218a'
};

const quoteStyle = {
    color: '#eee',
    fontSize: '18px',
    fontStyle: 'italic',
    lineHeight: '1.6',
    margin: '0 0 40px 0',
    padding: '0 20px'
};

const dateBoxStyle = {
    display: 'inline-block',
    borderTop: '1px solid currentColor',
    borderBottom: '1px solid currentColor',
    padding: '10px 40px',
    color: '#ffb3ff',
    fontSize: '24px',
    fontWeight: '300',
    letterSpacing: '2px',
    marginBottom: '40px'
};

const countdownContainer = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '40px'
};

const timeBox = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    padding: '15px 20px',
    borderRadius: '15px',
    minWidth: '80px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
};

const timeNum = {
    color: '#fff',
    fontSize: '36px',
    fontWeight: 'bold',
    lineHeight: '1.1'
};

const timeLabel = {
    color: '#ffb3ff',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '2px'
};

const primaryBtnStyle = {
    backgroundColor: '#e0218a',
    color: 'white',
    border: 'none',
    padding: '20px 40px',
    borderRadius: '30px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(224, 33, 138, 0.6)',
    transition: 'transform 0.3s ease',
    outline: 'none'
};

const formCardStyle = {
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(224, 33, 138, 0.4)',
    borderRadius: '25px',
    padding: '40px 30px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
    animation: 'fadeUp 0.5s ease-out'
};

const backBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#ffb3ff',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
    display: 'block',
    textAlign: 'left'
};

const inputStyle = {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(224, 33, 138, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    outline: 'none',
    fontSize: '16px',
    transition: 'all 0.3s ease'
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
    transition: 'transform 0.2s'
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
    boxShadow: '0 5px 15px rgba(255,255,255,0.2)'
};

const dividerStyle = {
    margin: '35px 0',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
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

// Inyectar animaciones globales dinámicamente y la fuente de invitaciones
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  input:focus { border-color: #ffccff !important; box-shadow: 0 0 15px rgba(255, 204, 255, 0.4) !important; }
  button:hover { transform: translateY(-3px); }
`;
if (typeof document !== 'undefined') {
    document.head.appendChild(styleSheet);
}

export default LoginView;
