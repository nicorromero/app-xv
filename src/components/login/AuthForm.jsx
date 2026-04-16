import React, { useState } from 'react';

/**
 * AuthForm — Formulario de autenticación (registro e inicio de sesión).
 * Recibe los handlers de Firebase como props para mantenerlo desacoplado.
 *
 * Props:
 *  - onGoogle: función que ejecuta el login con Google
 *  - onSubmit: función que ejecuta el login/registro con email+password
 *  - onBack: función para volver a la pantalla principal
 *  - loading: boolean que indica si hay una operación en curso
 *  - error: string con el mensaje de error a mostrar
 */
const AuthForm = ({ onGoogle, onSubmit, onBack, loading, error }) => {
    const [isRegistering, setIsRegistering] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [nota, setNota] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ isRegistering, email, password, nombre, apellido, nota });
    };

    return (
        <div style={styles.sectionForm}>
            <h2 style={styles.formTitle}>CONFIRMÁ TU ASISTENCIA</h2>
            <button style={styles.backBtn} onClick={onBack}>← Volver</button>

            {error && <div style={styles.errorBox}>{error}</div>}

            <button onClick={onGoogle} style={styles.googleBtn}>
                Continuar con Google
            </button>

            <div style={styles.formDivider}>— o —</div>

            <form onSubmit={handleSubmit} style={styles.form}>
                {isRegistering && (
                    <>
                        <input
                            style={styles.inputField}
                            type="text"
                            placeholder="Nombre"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                        />
                        <input
                            style={styles.inputField}
                            type="text"
                            placeholder="Apellido"
                            value={apellido}
                            onChange={e => setApellido(e.target.value)}
                            required
                        />
                        <textarea
                            style={styles.textareaField}
                            placeholder="Notas (alergias, etc.)"
                            value={nota}
                            onChange={e => setNota(e.target.value)}
                            rows={3}
                        />
                    </>
                )}
                <input
                    style={styles.inputField}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    style={styles.inputField}
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                    {loading ? 'Cargando...' : isRegistering ? 'Confirmar' : 'Entrar'}
                </button>
            </form>

            <div style={styles.toggleContainer}>
                <span style={styles.toggleLink} onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? '¿Ya confirmaste? Iniciá sesión' : '¿No tenés cuenta? Creá una'}
                </span>
            </div>
        </div>
    );
};

const styles = {
    sectionForm: {
        backgroundColor: 'rgba(25, 55, 85, 0.95)',
        padding: '60px 30px',
        minHeight: '100vh',
    },
    formTitle: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#FFFFFF',
        fontSize: '14px',
        cursor: 'pointer',
        padding: 0,
        marginBottom: '30px',
    },
    googleBtn: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: 'none',
        borderRadius: '25px',
        padding: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
    },
    formDivider: {
        textAlign: 'center',
        margin: '20px 0',
        color: 'rgba(255,255,255,0.7)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    inputField: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.4)',
        color: '#FFFFFF',
        padding: '15px',
        fontSize: '16px',
        outline: 'none',
    },
    textareaField: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.4)',
        color: '#FFFFFF',
        padding: '15px',
        fontSize: '15px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: "'Montserrat', sans-serif",
        lineHeight: '1.5',
        borderRadius: '4px',
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
    },
    errorBox: {
        backgroundColor: 'rgba(255,0,0,0.2)',
        color: '#ffcccc',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    toggleContainer: {
        textAlign: 'center',
        marginTop: '20px',
    },
    toggleLink: {
        color: '#4A90D9',
        cursor: 'pointer',
        marginLeft: '5px',
        fontWeight: 'bold',
        fontSize: '14px',
    },
};

export default AuthForm;
