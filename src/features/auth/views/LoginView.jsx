import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

import HeroSection from '../components/HeroSection';
import ScrollLazySection from '../../../components/ScrollLazySection';
import { bookDos, bookTres } from '../components/bookData';

const EventInfoSection = lazy(() => import('../components/EventInfoSection'));
const DressCodeSection  = lazy(() => import('../components/DressCodeSection'));
const RegaloSection     = lazy(() => import('../components/RegaloSection'));
const TriviaSection     = lazy(() => import('../components/TriviaSection'));
const BookSection       = lazy(() => import('../components/BookSection'));

const MotionDiv     = motion.div;
const MotionSection = motion.section;
const MotionButton  = motion.button;

const pageVariants = {
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, y: -14, transition: { duration: 0.2, ease: 'easeOut' } },
};

const LoginView = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    // ── Flujo principal: un toque → signInAnonymously → /votar ──────────────
    const handleGuestEntry = async () => {
        if (currentUser) {
            navigate('/votar');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { getAuth, signInAnonymously } = await import('firebase/auth');
            const { app } = await import('../../../services/firebase/app');
            const auth = getAuth(app);
            await signInAnonymously(auth);
            navigate('/votar');
        } catch (err) {
            console.error('Anonymous auth failed:', err.code || err.message);
            if (err.code === 'auth/operation-not-allowed') {
                setError('Autenticación anónima no habilitada. Contactá al organizador.');
            } else {
                setError('Error de conexión. Reintentá en un momento.');
            }
            setLoading(false);
        }
    };

    // ── Flujo secundario: staff / admin vía Google ───────────────────────────
    const handleStaffLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const { app } = await import('../../../services/firebase/app');
            const auth     = getAuth(app);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/votar');
        } catch (err) {
            console.warn('Staff Google auth failed:', err.code || err.message);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Error al ingresar con Google.');
            }
            setLoading(false);
        }
    };

    return (
        <main style={styles.container}>
            <div style={styles.ambientTop} />
            <div style={styles.ambientBottom} />

            <div style={styles.content}>
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

                    {/* ── CTA principal ─────────────────────────────────────── */}
                    <MotionSection
                        style={styles.ctaSection}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.45 }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                    >
                        <p style={styles.contentText2}>Prepárate para una noche inolvidable</p>

                        <MotionButton
                            id="btn-guest-entry"
                            className="app-button"
                            style={{
                                ...styles.primaryBtn,
                                opacity:       loading ? 0.75 : 1,
                                pointerEvents: loading ? 'none' : 'auto',
                            }}
                            onClick={handleGuestEntry}
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ y: -1 }}
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading
                                ? <Loader2 size={18} strokeWidth={2.2} style={{ animation: 'spin 1s linear infinite' }} />
                                : <CheckCircle2 size={18} strokeWidth={2.2} />
                            }
                            {loading ? 'Ingresando...' : 'Entrar a la fiesta'}
                        </MotionButton>

                        {error && (
                            <p style={styles.errorText} role="alert">{error}</p>
                        )}

                        {/* Acceso discreto para staff — intencionalmente invisible */}
                        <button
                            id="btn-staff-login"
                            style={styles.staffLink}
                            onClick={handleStaffLogin}
                            disabled={loading}
                            aria-label="Acceso para administradores"
                        >
                            Staff
                        </button>
                    </MotionSection>
                </MotionDiv>
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
    errorText: {
        fontSize: '13px',
        color: 'rgba(255, 120, 120, 0.9)',
        textAlign: 'center',
        maxWidth: '280px',
        lineHeight: 1.4,
    },
    // Botón deliberadamente discreto: letra pequeña, sin decoración prominente
    staffLink: {
        background: 'none',
        border: 'none',
        color: 'rgba(186, 230, 255, 0.25)',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '8px 16px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'color 0.2s',
    },
};

export default LoginView;
