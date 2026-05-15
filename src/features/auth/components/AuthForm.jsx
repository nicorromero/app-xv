import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, LogIn, UserRoundPlus } from 'lucide-react';

const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionForm = motion.form;

const fieldVariants = {
    hidden: { opacity: 0, height: 0, y: -8 },
    visible: {
        opacity: 1,
        height: 'auto',
        y: 0,
        transition: { duration: 0.24, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        height: 0,
        y: -8,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
};

const AuthForm = ({ onGoogle, onSubmit, onBack, loading, error }) => {
    const [isRegistering, setIsRegistering] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [nota, setNota] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;
        onSubmit({ isRegistering, email, password, nombre, apellido, nota });
    };

    return (
        <section style={styles.sectionForm}>
            <MotionDiv
                className="app-glass"
                style={styles.panel}
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
                <MotionButton
                    type="button"
                    className="app-button"
                    style={styles.backBtn}
                    onClick={onBack}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Volver a la invitación"
                >
                    <ArrowLeft size={18} />
                    Volver
                </MotionButton>

                <header style={styles.header}>
                    <span style={styles.kicker}>App-XV</span>
                    <h2 style={styles.formTitle}>Confirmá tu asistencia</h2>
                    <p style={styles.formSubtitle}>
                        Registrate para guardar tu lugar y entrar a la experiencia del evento.
                    </p>
                </header>

                <AnimatePresence>
                    {error && (
                        <MotionDiv
                            key="error"
                            style={styles.errorBox}
                            role="alert"
                            aria-live="polite"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {error}
                        </MotionDiv>
                    )}
                </AnimatePresence>

                <MotionButton
                    type="button"
                    onClick={onGoogle}
                    disabled={loading}
                    className="app-button"
                    style={styles.googleBtn}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                    <span style={styles.googleMark} aria-hidden="true">G</span>
                    Continuar con Google
                </MotionButton>

                <div style={styles.formDivider}>
                    <span style={styles.dividerLine} />
                    <span>o</span>
                    <span style={styles.dividerLine} />
                </div>

                <MotionForm onSubmit={handleSubmit} style={styles.form} layout>
                    <AnimatePresence initial={false}>
                        {isRegistering && (
                            <MotionDiv
                                key="register-fields"
                                variants={fieldVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={styles.registerFields}
                            >
                                <input
                                    className="app-input"
                                    style={styles.inputField}
                                    type="text"
                                    placeholder="Nombre"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    autoComplete="given-name"
                                    required
                                />
                                <input
                                    className="app-input"
                                    style={styles.inputField}
                                    type="text"
                                    placeholder="Apellido"
                                    value={apellido}
                                    onChange={e => setApellido(e.target.value)}
                                    autoComplete="family-name"
                                    required
                                />
                                <textarea
                                    className="app-input"
                                    style={styles.textareaField}
                                    placeholder="Notas (alergias, etc.)"
                                    value={nota}
                                    onChange={e => setNota(e.target.value)}
                                    rows={3}
                                />
                            </MotionDiv>
                        )}
                    </AnimatePresence>

                    <input
                        className="app-input"
                        style={styles.inputField}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                    <input
                        className="app-input"
                        style={styles.inputField}
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete={isRegistering ? 'new-password' : 'current-password'}
                        required
                    />
                    <MotionButton
                        type="submit"
                        disabled={loading}
                        className="app-button"
                        style={styles.primaryBtn}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="spin" size={18} />
                                Cargando...
                            </>
                        ) : isRegistering ? (
                            <>
                                <UserRoundPlus size={18} />
                                Confirmar
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Entrar
                            </>
                        )}
                    </MotionButton>
                </MotionForm>

                <div style={styles.toggleContainer}>
                    <span style={styles.toggleHint}>
                        {isRegistering ? '¿Ya confirmaste?' : '¿No tenés cuenta?'}
                    </span>
                    <MotionButton
                        type="button"
                        className="app-button"
                        style={styles.toggleLink}
                        onClick={() => setIsRegistering(!isRegistering)}
                        whileTap={{ scale: 0.97 }}
                    >
                        {isRegistering ? 'Iniciá sesión' : 'Creá una'}
                    </MotionButton>
                </div>
            </MotionDiv>
        </section>
    );
};

const styles = {
    sectionForm: {
        minHeight: '100vh',
        padding: '24px 16px 34px',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 0%, rgba(105, 200, 242, 0.2) 0%, rgba(6, 26, 47, 0) 42%)',
    },
    panel: {
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 18px 22px',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: '42px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(186, 230, 255, 0.16)',
        borderRadius: 'var(--radius-pill)',
        color: 'var(--color-text-muted)',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        padding: '0 14px',
        marginBottom: '24px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '22px',
    },
    kicker: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '28px',
        padding: '0 12px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(105, 200, 242, 0.12)',
        border: '1px solid rgba(105, 200, 242, 0.24)',
        color: 'var(--color-accent)',
        fontSize: '12px',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '12px',
    },
    formTitle: {
        fontSize: '26px',
        lineHeight: 1.12,
        fontWeight: 800,
        color: 'var(--color-text)',
        marginBottom: '10px',
        textWrap: 'balance',
    },
    formSubtitle: {
        fontSize: '14px',
        lineHeight: 1.55,
        color: 'var(--color-text-muted)',
        maxWidth: '330px',
        margin: '0 auto',
    },
    googleBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        minHeight: '52px',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        color: '#09233a',
        border: '1px solid rgba(255, 255, 255, 0.54)',
        borderRadius: 'var(--radius-pill)',
        padding: '0 18px',
        fontSize: '15px',
        fontWeight: 800,
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 14px 28px rgba(3, 15, 27, 0.16)',
    },
    googleMark: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        color: '#1a73e8',
        background: '#ffffff',
        border: '1px solid rgba(9, 35, 58, 0.12)',
        fontWeight: 900,
        fontSize: '15px',
    },
    formDivider: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '12px',
        margin: '20px 0',
        color: 'var(--color-text-soft)',
        fontSize: '13px',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    dividerLine: {
        height: '1px',
        background: 'rgba(186, 230, 255, 0.2)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '13px',
    },
    registerFields: {
        display: 'flex',
        flexDirection: 'column',
        gap: '13px',
        overflow: 'hidden',
    },
    inputField: {
        width: '100%',
        minHeight: '52px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(186, 230, 255, 0.2)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text)',
        padding: '0 16px',
        fontSize: '16px',
        outline: 'none',
    },
    textareaField: {
        width: '100%',
        minHeight: '92px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(186, 230, 255, 0.2)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text)',
        padding: '14px 16px',
        fontSize: '15px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: "'Montserrat', sans-serif",
        lineHeight: 1.45,
    },
    primaryBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        minHeight: '54px',
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
        color: '#052033',
        border: '1px solid rgba(255, 255, 255, 0.28)',
        borderRadius: 'var(--radius-pill)',
        padding: '0 22px',
        fontSize: '14px',
        fontWeight: 900,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        width: '100%',
        boxShadow: 'var(--shadow-glow)',
        marginTop: '2px',
    },
    errorBox: {
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error-text)',
        border: '1px solid var(--color-error-border)',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '18px',
        textAlign: 'center',
        fontSize: '14px',
        lineHeight: 1.45,
    },
    toggleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '20px',
        color: 'var(--color-text-muted)',
        fontSize: '14px',
    },
    toggleHint: {
        lineHeight: 1.4,
    },
    toggleLink: {
        minHeight: '40px',
        background: 'rgba(105, 200, 242, 0.12)',
        border: '1px solid rgba(105, 200, 242, 0.24)',
        borderRadius: 'var(--radius-pill)',
        color: 'var(--color-accent)',
        cursor: 'pointer',
        padding: '0 14px',
        fontWeight: 800,
        fontSize: '14px',
    },
};

export default AuthForm;
