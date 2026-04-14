import React, { useState } from 'react';
import { Star, Lock } from 'lucide-react';
import AdminTrigger from '../components/AdminTrigger';
import { useAuth } from '../context/AuthContext';
import { useVotaciones } from '../hooks/useVotaciones';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { categoriasYcandidatos as categorias } from '../config/categorias';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function VotarView() {
    const { isAdmin } = useAuth();
    const isOnline = useOnlineStatus();
    const { votacionActiva, toggleCategoria } = useVotaciones();
    const { emitirVoto } = useResultadosVotos();

    const [catSeleccionada, setCatSeleccionada] = useState(null);
    const [votoTemporal, setVotoTemporal] = useState(null);

    const categoriasActivas = categorias.filter(cat => votacionActiva[cat.id] === true);
    const isForcedClient = !isAdmin && categoriasActivas.length > 0;
    const categoriaARenderizar = isForcedClient ? categoriasActivas[0] : catSeleccionada;

    const isChromeIOS = /CriOS/i.test(navigator.userAgent);
    // Si quieres ser agresivo con la solución de Chrome iOS:
    useEffect(() => {
        if (isChromeIOS && !isOnline) {
            // Solo si detectas que está offline o falla, podrías intentar abrir en Safari
            // window.location.href = 'googlechromes://' + window.location.href.replace(/https?:\/\//, '');
        }
    }, [isChromeIOS, isOnline]);

    // Vista: ya votó
    if (categoriaARenderizar) {
        const yaVoto = localStorage.getItem(`voto_${categoriaARenderizar.id}`) === 'true' || votoTemporal === categoriaARenderizar.id;

        if (yaVoto && !isAdmin) {
            return (
                <div style={styles.container}>
                    <div style={styles.votoConfirmadoCard}>
                        <p style={{ fontSize: '36px', margin: '0 0 12px 0' }}>🎟️</p>
                        <h3 style={styles.votoConfirmadoTitle}>
                            {isOnline ? '¡Voto registrado!' : '¡Voto guardado!'}
                        </h3>
                        <p style={styles.votoConfirmadoText}>
                            {isOnline
                                ? 'Prestá atención a la pantalla gigante para ver los resultados en vivo.'
                                : 'Tu voto se enviará automáticamente cuando recuperes señal.'}
                        </p>
                    </div>
                </div>
            );
        }

        // Vista: votando
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <Star style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                    <h2 style={styles.title}>{categoriaARenderizar.titulo}</h2>
                    <p style={styles.subtitle}>Elegí a tu favorito</p>
                </div>

                <div style={styles.opcionesContainer}>
                    {categoriaARenderizar.candidatos.map(c => (
                        <button
                            key={c}
                            onClick={() => {
                                emitirVoto(categoriaARenderizar.id, c);
                                if (!isAdmin) {
                                    setVotoTemporal(categoriaARenderizar.id);
                                } else {
                                    setCatSeleccionada(null);
                                }
                            }}
                            style={styles.candidatoBtn}
                            onMouseOver={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(201, 127, 163, 0.4)';
                                e.currentTarget.style.borderColor = '#c97fa3';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {!isForcedClient && (
                    <button
                        onClick={() => setCatSeleccionada(null)}
                        style={styles.backBtn}
                    >
                        ← Volver a categorías
                    </button>
                )}
            </div>
        );
    }

    // Vista: lista de categorías
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <AdminTrigger>
                    <Star style={styles.icon} strokeWidth={1.5} color="#F9F9F9" />
                    <h2 style={styles.title}>Premios de la Noche</h2>
                </AdminTrigger>
                <p style={styles.subtitle}>¡Andá pensando en tu favorito!</p>
            </div>

            <div style={styles.categoriasContainer}>
                {categorias.map(cat => {
                    const isCatActive = votacionActiva[cat.id] === true;
                    return (
                        <div key={cat.id} style={styles.categoriaRow}>
                            <button
                                onClick={() => { if (isCatActive) setCatSeleccionada(cat); }}
                                style={{
                                    ...styles.categoriaBtn,
                                    opacity: isCatActive ? 1 : 0.5,
                                    cursor: isCatActive ? 'pointer' : 'not-allowed',
                                    borderColor: isCatActive ? '#c97fa3' : 'rgba(255,255,255,0.15)',
                                    backgroundColor: isCatActive ? 'rgba(201,127,163,0.15)' : 'rgba(255,255,255,0.05)',
                                }}
                            >
                                {!isCatActive && (
                                    <Lock size={14} strokeWidth={2} color="rgba(255,255,255,0.4)" style={{ marginRight: '8px', flexShrink: 0 }} />
                                )}
                                <span>{cat.titulo}</span>
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => toggleCategoria(cat.id)}
                                    style={{
                                        ...styles.adminToggleBtn,
                                        backgroundColor: isCatActive ? 'rgba(200,60,60,0.7)' : 'rgba(60,180,100,0.7)',
                                    }}
                                >
                                    {isCatActive ? 'Cerrar' : 'Abrir'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: '#FFFFFF',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px 16px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '24px',
    },
    icon: {
        width: '48px',
        height: 'auto',
        display: 'block',
        margin: '0 auto 12px auto',
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        letterSpacing: '1px',
        margin: '0 0 6px 0',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.65)',
        margin: 0,
    },
    categoriasContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    categoriaRow: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    categoriaBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        color: '#FFFFFF',
        padding: '15px 16px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
        textAlign: 'left',
        transition: 'all 0.2s ease',
    },
    adminToggleBtn: {
        padding: '14px 12px',
        borderRadius: '12px',
        border: 'none',
        fontWeight: '700',
        cursor: 'pointer',
        color: 'white',
        minWidth: '75px',
        fontSize: '13px',
        fontFamily: "'Montserrat', sans-serif",
        transition: 'all 0.2s ease',
    },
    opcionesContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
    },
    candidatoBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        color: '#FFFFFF',
        padding: '16px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: "'Montserrat', sans-serif",
        transition: 'all 0.2s ease',
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '10px 0',
        fontFamily: "'Montserrat', sans-serif",
        display: 'block',
        margin: '0 auto',
    },
    votoConfirmadoCard: {
        backgroundColor: 'rgba(141, 90, 115, 0.45)',
        borderRadius: '20px',
        padding: '50px 30px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
        marginTop: '20px',
    },
    votoConfirmadoTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#FFFFFF',
        margin: '0 0 12px 0',
    },
    votoConfirmadoText: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.75)',
        lineHeight: '1.6',
        margin: 0,
    },
};

export default VotarView;
