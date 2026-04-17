import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../services/firebase/config';
import {
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Subcomponentes - ver BookSection.jsx para docs de cómo usar múltiples galerías
import HeroSection from '../components/HeroSection';
import EventInfoSection from '../components/EventInfoSection';
import DressCodeSection from '../components/DressCodeSection';
import RegaloSection from '../components/RegaloSection';
import BookSection, { bookDos, bookTres } from '../components/BookSection';
import TriviaSection from '../components/TriviaSection';
import AuthForm from '../components/AuthForm';

// Inyectar fuentes y animaciones globales una sola vez
if (typeof document !== 'undefined' && !document.getElementById('login-global-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'login-global-styles';
    styleSheet.innerText = `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;700&display=swap');
        @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        input:focus { border-color: #4A90D9 !important; box-shadow: 0 0 15px rgba(74, 144, 217, 0.4) !important; }
        button:hover { transform: translateY(-3px); }
    `;
    document.head.appendChild(styleSheet);
}

/**
 * LoginView — Vista de invitación / autenticación.
 *
 * Responsabilidad: Coordinar los subcomponentes y toda la lógica de Firebase.
 * NO contiene JSX de bajo nivel; delega eso a HeroSection, TriviaSection y AuthForm.
 */
const LoginView = () => {
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

    // EFECTO CRÍTICO: Persistencia de sesión.
    // Si el usuario ya tiene sesión activa, lo redirigimos directo a la app.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) navigate('/votar');
            setIsChecking(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // Cuenta regresiva al evento
    useEffect(() => {
        const fechaEvento = new Date('2026-05-23T20:00:00').getTime();
        const interval = setInterval(() => {
            const distance = fechaEvento - Date.now();
            if (distance < 0) {
                setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
                clearInterval(interval);
                return;
            }
            setTimeLeft({
                dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
                horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                segundos: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ─── Lógica de Firebase ────────────────────────────────────────────────────

    const saveGuestProfile = async (user, displayName, apellido = '', nota = '') => {
        const docRef = doc(db, 'invitados', user.uid);
        await setDoc(docRef, {
            nombre: displayName || user.email.split('@')[0],
            apellido,
            nota,
            email: user.email,
            ultimoAcceso: serverTimestamp(),
        }, { merge: true });
    };

    const handleGoogle = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await saveGuestProfile(result.user, result.user.displayName);
            navigate('/votar');
        } catch (err) {
            console.error(err);
            setError('Error al ingresar con Google. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async ({ isRegistering, email, password, nombre, apellido, nota }) => {
        setLoading(true);
        setError('');
        try {
            if (isRegistering) {
                if (!nombre.trim()) throw new Error('Por favor ingresa tu nombre');
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: `${nombre} ${apellido}`.trim() });
                await saveGuestProfile(result.user, nombre, apellido, nota);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/votar');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') setError('El email ya está registrado.');
            else if (err.code === 'auth/invalid-credential') setError('Credenciales incorrectas.');
            else setError(err.message || 'Ocurrió un error. Reintenta.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    if (isChecking) {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'white', fontFamily: 'Montserrat' }}>Cargando sesión...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {!showForm && (
                    <>
                        <HeroSection timeLeft={timeLeft} />
                        <div style={styles.contentText}>Hay momentos inolvidables que se atesoran con el corazón para siempre, por esa razón, quiero que compartas conmigo esté día tan especial</div>
                        <EventInfoSection />
                        <BookSection fotos={bookDos} />
                        <DressCodeSection />
                        <RegaloSection />
                        <BookSection />
                        <TriviaSection />
                        <BookSection fotos={bookTres} />
                        <div style={styles.contentText2}>Prepárate para una noche inolvidable</div>
                        <div style={styles.subSection}>
                            <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
                                CONFIRMÁ TU LUGAR
                            </button>
                        </div>
                    </>
                )}

                {showForm && (
                    <AuthForm
                        onGoogle={handleGoogle}
                        onSubmit={handleSubmit}
                        onBack={() => setShowForm(false)}
                        loading={loading}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: '#FFFFFF',
        margin: '0 auto',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        background: 'linear-gradient(160deg, #3d1a2e 0%, #7d4e6a 50%, #5a2040 100%)',
    },
    content: {
        position: 'relative',
        zIndex: 10,
    },
    subSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        backgroundColor: '#2E5C8A',
    },
    contentText: {
        fontSize: '30px',
        fontFamily: "'Great Vibes', cursive",
        textAlign: 'center',
        padding: '40px 20px',
        color: 'rgba(255,255,255,0.8)',
        backgroundColor: '#2E5C8A',
    },
    contentText2: {
        fontSize: '35px',
        fontFamily:"'Great Vibes', cursive",
        textAlign: 'center',
        padding: '30px 0 50px 0',
        color: 'rgba(255,255,255,0.8)',
        backgroundColor: 'rgb(100, 180, 220)',
    },
    primaryBtn: {
        backgroundColor: '#4A90D9',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '25px',
        padding: '15px 30px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        maxWidth: '300px',
        animation: 'fadeUp 1s ease-out',
    },
};

export default LoginView;
