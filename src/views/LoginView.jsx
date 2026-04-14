import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Camera, Gift, Calendar, MapPin, Gem } from 'lucide-react';
import book from '../../dist/assets/book.png';
import book1 from '../../dist/assets/book1.png';
import book2 from '../../dist/assets/book2.png';




const quizPreguntas = [
    {
        pregunta: '¿Cuál es el color favorito de Paulina?',
        opciones: ['Rojo', 'Rosa', 'Azul marino', 'Verde'],
        correcta: 1
    },
    {
        pregunta: '¿Cuál es el día de la semana favorito de Paulina?',
        opciones: ['Lunes', 'Sábado', 'Miércoles', 'Viernes'],
        correcta: 1
    },
    {
        pregunta: '¿Cuál es la comida favorita de Paulina?',
        opciones: ['Pizza', 'Sushi', 'Hamburguesa', 'Pasta'],
        correcta: 1
    }
];

const LoginView = () => {
    // Estados de vistas
    const [showForm, setShowForm] = useState(false);

    // Estados del formulario
    const [isRegistering, setIsRegistering] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [nota, setNota] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModalRegalo, setShowModalRegalo] = useState(false);
    const [showModalAlbum, setShowModalAlbum] = useState(false);
    const fotosBook = [book, book1, book2];

    // Estados del Carrusel y Cuenta Regresiva
    const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

    // Estados del Quiz
    const [quizStep, setQuizStep] = useState(0);       // 0-2: pregunta actual, 3: terminado
    const [quizAnswers, setQuizAnswers] = useState([]); // respuestas elegidas
    const [quizSelected, setQuizSelected] = useState(null); // opcion seleccionada en paso actual

    // Efecto de la cuenta regresiva
    useEffect(() => {
        const fechaEvento = new Date("2026-09-26T20:00:00").getTime();
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
    }, []);

    // ===== LÓGICA DE FIREBASE =====
    const saveGuestProfile = async (user, displayName, apellidoParam, notaParam) => {
        const docRef = doc(db, 'invitados', user.uid);
        await setDoc(docRef, {
            nombre: displayName || user.email.split('@')[0],
            apellido: apellidoParam || '',
            nota: notaParam || '',
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
                if (!nombre.trim()) throw new Error("Por favor ingresa tu nombre");
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: `${nombre} ${apellido}`.trim() });
                await saveGuestProfile(result.user, nombre, apellido, nota);
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
        <div style={styles.container}>

            {/* CONTENIDO PRINCIPAL CON SCROLL */}
            <div style={styles.content}>
                {!showForm && (
                    <>
                        {/* SECCIÓN 1 — HERO */}
                        <div style={styles.sectionHero}>
                            <p style={styles.heroSubText}>MIS 15</p>
                            <h1 style={styles.heroTitle}>Paulina</h1>
                            <p style={styles.heroDate}>26 · SEPTIEMBRE · 2026</p>

                            <div style={styles.countdownContainer}>
                                <div style={styles.timeBox}>
                                    <span style={styles.timeNum}>{timeLeft.dias}</span>
                                    <span style={styles.timeLabel}>DÍAS</span>
                                </div>
                                <div style={styles.timeBox}>
                                    <span style={styles.timeNum}>{timeLeft.horas}</span>
                                    <span style={styles.timeLabel}>HS</span>
                                </div>
                                <div style={styles.timeBox}>
                                    <span style={styles.timeNum}>{timeLeft.minutos}</span>
                                    <span style={styles.timeLabel}>MIN</span>
                                </div>
                                <div style={styles.timeBox}>
                                    <span style={styles.timeNum}>{timeLeft.segundos}</span>
                                    <span style={styles.timeLabel}>SEG</span>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2 — INFO DEL EVENTO */}
                        <div style={styles.section2}>
                            <div style={styles.eventItem}>
                                <Calendar style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                                <p style={styles.labelSmall}>¿CUÁNDO?</p>
                                <p style={styles.labelLarge}>26 DE SEPTIEMBRE 2026 | 20:00 HS</p>
                            </div>
                            <div style={styles.separator}></div>
                            <div style={styles.eventItem}>
                                <MapPin style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                                <p style={styles.labelSmall}>¿DÓNDE?</p>
                                <p style={styles.labelLarge}>JANO'S PUERTO MADERO</p>
                                <button style={styles.outlineBtn} onClick={() => window.open('https://maps.google.com', '_blank')}>
                                    CÓMO LLEGAR
                                </button>
                            </div>
                        </div>

                        {/* SECCIÓN 3 — BOOK DE FOTOS */}
                        <div style={styles.sectionBook}>
                            <p style={styles.bookTitle}>BOOK DE FOTOS</p>

                            <div style={styles.photoSlider}>
                                {/* Usamos las primeras 3 fotos de tu array fotosBook */}
                                {fotosBook.slice(0, 2).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Book ${index + 1}`}
                                        style={styles.bookPhoto}
                                    />
                                ))}
                            </div>
                        </div>


                        {/* SECCIÓN 3 — DRESS CODE */}
                        <div style={styles.section3}>
                            <Gem style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                            <h2 style={styles.dressCodeTitle}>DRESS CODE</h2>
                            <p style={styles.dressCodeValue}>FORMAL</p>
                            <p style={styles.dressCodeHint}>El color rosa se reserva para la quinceañera</p>
                        </div>

                        {/* SECCIÓN 4 — ÁLBUM Y REGALOS */}
                        <div style={styles.section4}>
                            <div style={styles.subSection}>
                                <Camera style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                                <p style={styles.albumText}>¡Compartí tus fotos!</p>
                                <button style={styles.primaryBtn} onClick={() => setShowModalAlbum(true)}>
                                    IR AL ÁLBUM
                                </button>
                            </div>
                            <div style={styles.separator}></div>
                            <div style={styles.subSection}>
                                <Gift style={styles.iconGraphic} strokeWidth={1.5} color="#F9F9F9" />
                                <p style={styles.albumText}>Si querés hacerme un regalo...</p>
                                <button style={styles.primaryBtn} onClick={() => setShowModalRegalo(true)}>
                                    VER CUENTA
                                </button>
                            </div>
                        </div>

                        {/* SECCIÓN TRIVIA */}
                        <div style={styles.sectionTrivia}>
                            <p style={styles.triviaTitle}>¿Cuánto me conocés?</p>

                            {quizStep < quizPreguntas.length ? (
                                <div style={styles.triviaCard}>
                                    <p style={styles.triviaPasoLabel}>
                                        {quizStep + 1} de {quizPreguntas.length}
                                    </p>
                                    <p style={styles.triviaPregunta}>
                                        {quizPreguntas[quizStep].pregunta}
                                    </p>
                                    <div style={styles.triviaOpciones}>
                                        {quizPreguntas[quizStep].opciones.map((op, i) => (
                                            <button
                                                type="button"
                                                key={i}
                                                style={{
                                                    ...styles.triviaOpcionBtn,
                                                    ...(quizSelected === i ? styles.triviaOpcionSeleccionada : {})
                                                }}
                                                onClick={() => setQuizSelected(i)}
                                            >
                                                {op}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        style={{
                                            ...styles.triviaSiguienteBtn,
                                            opacity: quizSelected === null ? 0.4 : 1,
                                            cursor: quizSelected === null ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={quizSelected === null}
                                        onClick={() => {
                                            if (quizSelected === null) return;
                                            const respuestaActual = quizSelected;
                                            setQuizAnswers(prev => [...prev, respuestaActual]);
                                            setQuizSelected(null);
                                            setQuizStep(prev => prev + 1);
                                        }}
                                    >
                                        {quizStep < quizPreguntas.length - 1 ? 'Siguiente →' : 'Ver resultados'}
                                    </button>
                                </div>
                            ) : quizAnswers.length === quizPreguntas.length ? (
                                <div style={styles.triviaCard}>
                                    <p style={styles.triviaResultadoTitulo}>Tus resultados</p>
                                    {quizPreguntas.map((q, i) => {
                                        const respuesta = quizAnswers[i];
                                        const acerto = respuesta === q.correcta;
                                        const textoRespuesta = respuesta != null ? q.opciones[respuesta] : '—';
                                        return (
                                            <div key={i} style={styles.triviaResultadoItem}>
                                                <p style={styles.triviaResultadoPregunta}>{q.pregunta}</p>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        ...styles.triviaResultadoBadge,
                                                        backgroundColor: acerto ? 'rgba(100,220,120,0.25)' : 'rgba(220,80,80,0.25)',
                                                        borderColor: acerto ? '#6ddc78' : '#dc5050'
                                                    }}>
                                                        {textoRespuesta}
                                                    </span>
                                                    {!acerto && (
                                                        <span style={styles.triviaResultadoCorrecto}>
                                                            → {q.opciones[q.correcta]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        style={styles.triviaSiguienteBtn}
                                        onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizSelected(null); }}
                                    >
                                        Volver a jugar
                                    </button>
                                </div>
                            ) : (
                                // Estado de seguridad si los estados no sincronizaron
                                <div style={styles.triviaCard}>
                                    <p style={styles.triviaPasoLabel}>Cargando resultados...</p>
                                </div>
                            )}
                        </div>

                        {/* SECCIÓN 5 — BOOK DE FOTOS */}
                        <div style={styles.sectionBook}>
                            <p style={styles.bookTitle}>BOOK DE FOTOS</p>

                            <div style={styles.photoSlider}>
                                {/* Usamos las primeras 3 fotos de tu array fotosBook */}
                                {fotosBook.slice(0, 2).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Book ${index + 1}`}
                                        style={styles.bookPhoto}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* SECCIÓN 5 — INVITACION */}
                        <div style={styles.separator}></div>
                        <div style={styles.subSection}>
                            <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
                                CONFIRMÁ TU LUGAR
                            </button>
                        </div>
                    </>
                )}

                {/* SECCIÓN 6 — FORMULARIO RSVP */}
                {showForm && (
                    <div style={styles.sectionForm}>
                        <h2 style={styles.formTitle}>CONFIRMÁ TU ASISTENCIA</h2>
                        <button style={styles.backBtn} onClick={() => setShowForm(false)}>
                            ← Volver
                        </button>

                        {error && <div style={styles.errorBox}>{error}</div>}

                        <button onClick={handleGoogle} style={styles.googleBtn}>
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
                                        placeholder="¿Algo más que debamos saber? (celíaco, alergias, etc.)"
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
                            <span style={styles.toggleText}>
                                {isRegistering ? '¿Ya confirmaste?' : '¿Todavía no confirmaste?'}
                            </span>
                            <span
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                style={styles.toggleLink}
                            >
                                {isRegistering ? 'Iniciá sesión acá' : 'Crear cuenta'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL REGALO */}
            {showModalRegalo && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <h3 style={styles.modalTitle}>Datos para transferencia</h3>
                        <p style={styles.modalText}><strong>ALIAS:</strong> paulina.quince</p>
                        <p style={styles.modalText}><strong>CVU:</strong> 0000000000000000000000</p>
                        <button style={styles.primaryBtn} onClick={() => setShowModalRegalo(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL ÁLBUM */}
            {showModalAlbum && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <p style={{ fontSize: '40px', margin: '0 0 15px 0' }}>📸</p>
                        <h3 style={styles.modalTitle}>¡Próximamente!</h3>
                        <p style={{ ...styles.modalText, color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.5' }}>
                            El álbum de fotos estará disponible durante la fiesta.
                            ¡Vas a poder compartir y ver todos los momentos en tiempo real!
                        </p>
                        <button style={{ ...styles.primaryBtn, marginTop: '20px' }} onClick={() => setShowModalAlbum(false)}>
                            ¡Entendido!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== ESTILOS =====
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

    sectionBook: {
        backgroundColor: '#8B5D74', // El rosa/malva de tu paleta
        padding: '20px 0', // Espacio arriba y abajo
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    photoSlider: {
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        width: '100%',
        gap: '10px',
        padding: '0 20px',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    },
    bookPhoto: {
        flexShrink: 0,
        minWidth: '85%',
        height: '400px',
        objectFit: 'cover',
        borderRadius: '15px',
        scrollSnapAlign: 'center',
        display: 'block',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    bookTitle: {
        color: '#FFFFFF',
        fontSize: '1.2rem',
        marginBottom: '15px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
    },

    bgImage: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'opacity 2s ease-in-out',
        zIndex: 1,
    },

    iconGraphic: {
        width: '60px',  // O el tamaño que prefieras
        height: 'auto', // Esto evita que se deforme
        display: 'block',
        margin: '0 auto 15px auto',
    },

    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(80, 30, 55, 0.55)',
        zIndex: 2,
    },
    content: {
        position: 'relative',
        zIndex: 10,
    },
    sectionHero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px',
    },
    heroSubText: {
        textTransform: 'uppercase',
        letterSpacing: '4px',
        fontSize: '14px',
        margin: '0 0 10px 0',
    },
    heroTitle: {
        fontFamily: "'Great Vibes', cursive",
        fontSize: '72px',
        margin: '0 0 10px 0',
        fontWeight: 'normal',
    },
    heroDate: {
        textTransform: 'uppercase',
        fontWeight: '300',
        fontSize: '14px',
        margin: '0 0 40px 0',
    },
    countdownContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '40px',
    },
    timeBox: {
        backgroundColor: 'rgba(100, 40, 70, 0.8)',
        borderRadius: '12px',
        padding: '15px 10px',
        minWidth: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    timeNum: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    timeLabel: {
        fontSize: '10px',
    },
    primaryBtn: {
        backgroundColor: '#c97fa3',
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
        marginBottom: '50px'
    },
    section2: {
        backgroundColor: '#7d4e6a',
        padding: '60px 30px',
        textAlign: 'center',
    },
    eventItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    icon: {
        fontSize: '32px',
        marginBottom: '10px',
    },
    labelSmall: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '5px',
    },
    labelLarge: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    separator: {
        height: '1px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        margin: '30px 0',
        width: '100%',
    },
    outlineBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #FFFFFF',
        color: '#FFFFFF',
        borderRadius: '25px',
        padding: '12px 25px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    section3: {
        backgroundColor: 'rgba(100, 40, 70, 0.9)',
        padding: '50px 30px',
        textAlign: 'center',
    },
    dressCodeTitle: {
        fontSize: '24px',
        margin: '10px 0',
    },
    dressCodeValue: {
        letterSpacing: '4px',
        fontSize: '18px',
        margin: '5px 0',
    },
    dressCodeHint: {
        fontStyle: 'italic',
        fontSize: '12px',
        marginTop: '10px',
        color: 'rgba(255,255,255,0.7)',
    },
    section4: {
        backgroundColor: '#7d4e6a',
        padding: '60px 30px',
        textAlign: 'center',
    },
    subSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    albumText: {
        margin: '10px 0 20px 0',
    },
    sectionForm: {
        backgroundColor: 'rgba(80, 30, 55, 0.95)',
        padding: '60px 30px',
        minHeight: '100vh',
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
    formTitle: {
        textAlign: 'center',
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
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
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
    toggleText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
    },
    toggleLink: {
        color: '#c97fa3',
        cursor: 'pointer',
        marginLeft: '5px',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    modalCard: {
        backgroundColor: '#7d4e6a',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '80%',
        textAlign: 'center',
        color: '#FFFFFF',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
    },
    modalTitle: {
        marginTop: 0,
        marginBottom: '20px',
    },
    modalText: {
        margin: '10px 0',
    },

    // ===== QUIZ STYLES =====
    sectionTrivia: {
        backgroundColor: 'rgba(100, 40, 70, 0.6)',
        padding: '40px 25px',
        textAlign: 'center',
    },
    triviaTitle: {
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '1px',
        marginBottom: '20px',
    },
    triviaCard: {
        backgroundColor: 'rgba(141, 90, 115, 0.5)',
        borderRadius: '16px',
        padding: '25px 20px',
        backdropFilter: 'blur(8px)',
    },
    triviaPasoLabel: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '1px',
        marginBottom: '10px',
    },
    triviaPregunta: {
        fontSize: '17px',
        fontWeight: '600',
        marginBottom: '20px',
        lineHeight: '1.4',
    },
    triviaOpciones: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
    },
    triviaOpcionBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '10px',
        color: '#FFFFFF',
        padding: '12px 16px',
        fontSize: '15px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        fontFamily: "'Montserrat', sans-serif",
    },
    triviaOpcionSeleccionada: {
        backgroundColor: 'rgba(201, 127, 163, 0.5)',
        border: '1px solid #c97fa3',
        fontWeight: '700',
    },
    triviaSiguienteBtn: {
        backgroundColor: '#c97fa3',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '20px',
        padding: '12px 30px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '5px',
        fontFamily: "'Montserrat', sans-serif",
    },
    triviaResultadoTitulo: {
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
    },
    triviaResultadoItem: {
        marginBottom: '18px',
        textAlign: 'left',
    },
    triviaResultadoPregunta: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '6px',
    },
    triviaResultadoBadge: {
        border: '1px solid',
        borderRadius: '8px',
        padding: '4px 10px',
        fontSize: '14px',
        fontWeight: '600',
    },
    triviaResultadoCorrecto: {
        fontSize: '13px',
        color: '#6ddc78',
    },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;700&display=swap');
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  input:focus { border-color: #c97fa3 !important; box-shadow: 0 0 15px rgba(201, 127, 163, 0.4) !important; }
  button:hover { transform: translateY(-3px); }
`;
if (typeof document !== 'undefined') {
    document.head.appendChild(styleSheet);
}

export default LoginView;
