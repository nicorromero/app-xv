import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

import HeroSection from '../components/HeroSection';
import ScrollLazySection from '../../../components/ScrollLazySection';
import { bookDos, bookTres } from '../components/bookData';

const EventInfoSection = lazy(() => import('../components/EventInfoSection'));
const DressCodeSection = lazy(() => import('../components/DressCodeSection'));
const RegaloSection = lazy(() => import('../components/RegaloSection'));
const TriviaSection = lazy(() => import('../components/TriviaSection'));
const BookSection = lazy(() => import('../components/BookSection'));
const AuthForm = lazy(() => import('../components/AuthForm'));

const MotionDiv = motion.div;
const MotionSection = motion.section;
const MotionButton = motion.button;

const pageVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        y: -14,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
};

const LoginView = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            navigate('/votar');
        }
    }, [currentUser, navigate]);

    const saveGuestProfile = async (user, displayName, apellido = '', nota = '') => {
        const { db } = await import('../../../services/firebase/db');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

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
            const { app } = await import('../../../services/firebase/app');
            const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');

            const auth = getAuth(app);
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
            const { app } = await import('../../../services/firebase/app');
            const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            const auth = getAuth(app);

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

    return (
        <main style={styles.container}>
            <div style={styles.ambientTop} />
            <div style={styles.ambientBottom} />
            <div style={styles.content}>
                <AnimatePresence mode="wait">
                    {!showForm ? (
                        <MotionDiv
                            key="invitation"
                            variants={pageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <HeroSection />

                            <MotionSection
                                className="app-glass"
                                style={styles.contentTextPanel}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.35 }}
                                transition={{ duration: 0.42, ease: 'easeOut' }}
                            >
                                <p style={styles.contentText}>
                                    Hay momentos inolvidables que se atesoran con el corazón para siempre.
                                    Por esa razón, quiero que compartas conmigo este día tan especial.
                                </p>
                            </MotionSection>

                            <ScrollLazySection minHeight="400px">
                                <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
                                    <EventInfoSection />
                                </Suspense>
                            </ScrollLazySection>

                            <ScrollLazySection minHeight="500px">
                                <Suspense fallback={<div style={{ minHeight: '500px' }} />}>
                                    <BookSection fotos={bookDos} />
                                </Suspense>
                            </ScrollLazySection>

                            <ScrollLazySection minHeight="400px">
                                <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
                                    <DressCodeSection />
                                </Suspense>
                            </ScrollLazySection>

                            <ScrollLazySection minHeight="400px">
                                <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
                                    <RegaloSection />
                                </Suspense>
                            </ScrollLazySection>

                            <ScrollLazySection minHeight="500px">
                                <Suspense fallback={<div style={{ minHeight: '500px' }} />}>
                                    <BookSection />
                                </Suspense>
                            </ScrollLazySection>

                            <ScrollLazySection minHeight="400px">
                                <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
                                    <TriviaSection />
                                </Suspense>
                            </ScrollLazySection>

                            <ScrollLazySection minHeight="500px">
                                <Suspense fallback={<div style={{ minHeight: '500px' }} />}>
                                    <BookSection fotos={bookTres} />
                                </Suspense>
                            </ScrollLazySection>

                            <MotionSection
                                style={styles.ctaSection}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.45 }}
                                transition={{ duration: 0.42, ease: 'easeOut' }}
                            >
                                <p style={styles.contentText2}>Prepárate para una noche inolvidable</p>
                                <MotionButton
                                    className="app-button"
                                    style={styles.primaryBtn}
                                    onClick={() => setShowForm(true)}
                                    whileTap={{ scale: 0.97 }}
                                    whileHover={{ y: -1 }}
                                >
                                    <CheckCircle2 size={18} strokeWidth={2.2} />
                                    Confirmá tu lugar
                                </MotionButton>
                            </MotionSection>
                        </MotionDiv>
                    ) : (
                        <MotionDiv
                            key="form"
                            variants={pageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <Suspense fallback={(
                                <div style={styles.loadingFallback}>
                                    <span className="custom-spinner" aria-label="Cargando formulario" />
                                </div>
                            )}
                            >
                                <AuthForm
                                    onGoogle={handleGoogle}
                                    onSubmit={handleSubmit}
                                    onBack={() => setShowForm(false)}
                                    loading={loading}
                                    error={error}
                                />
                            </Suspense>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: 'var(--color-text)',
        margin: '0 auto',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        background: 'radial-gradient(circle at 50% 0%, rgba(105, 200, 242, 0.25) 0%, rgba(10, 42, 69, 0) 34%), linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg) 48%, #08253d 100%)',
    },
    ambientTop: {
        position: 'absolute',
        inset: '0 0 auto 0',
        height: '340px',
        background: 'linear-gradient(135deg, rgba(105, 200, 242, 0.18), rgba(255, 255, 255, 0))',
        pointerEvents: 'none',
    },
    ambientBottom: {
        position: 'absolute',
        right: '-90px',
        bottom: '120px',
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        background: 'rgba(45, 159, 224, 0.18)',
        filter: 'blur(56px)',
        pointerEvents: 'none',
    },
    content: {
        position: 'relative',
        zIndex: 10,
    },
    contentTextPanel: {
        margin: '22px 18px 30px',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 22px',
    },
    contentText: {
        fontSize: '28px',
        fontFamily: "'Great Vibes', cursive",
        lineHeight: 1.25,
        textAlign: 'center',
        color: 'var(--color-text)',
        textWrap: 'balance',
    },
    ctaSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '22px',
        padding: '42px 20px 54px',
        background: 'linear-gradient(180deg, rgba(105, 200, 242, 0.02), rgba(105, 200, 242, 0.12))',
        borderTop: '1px solid rgba(186, 230, 255, 0.14)',
    },
    contentText2: {
        fontSize: '32px',
        fontFamily: "'Great Vibes', cursive",
        lineHeight: 1.15,
        textAlign: 'center',
        color: 'var(--color-text)',
        textWrap: 'balance',
    },
    primaryBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        minHeight: '52px',
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
        color: '#052033',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: 'var(--radius-pill)',
        padding: '15px 28px',
        fontSize: '14px',
        fontWeight: 800,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        width: '100%',
        maxWidth: '310px',
        boxShadow: 'var(--shadow-glow)',
    },
    loadingFallback: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default LoginView;
