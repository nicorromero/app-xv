import React, { useState, useEffect } from 'react';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { useCategorias } from '../hooks/useCategorias';
import { useVotaciones } from '../hooks/useVotaciones';
import { motion, AnimatePresence } from 'framer-motion';

// Componente para la lluvia de estrellas sutil del modo Espera
const LluviaEstrellas = () => {
    const particles = Array.from({ length: 40 });
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map((_, i) => {
                const size = Math.random() * 4 + 2;
                const left = Math.random() * 100;
                const duration = Math.random() * 5 + 5;
                const delay = Math.random() * 5;
                return (
                    <motion.div
                        key={i}
                        initial={{ y: '-10vh', x: `${left}vw`, opacity: 0 }}
                        animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
                        transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            width: size, height: size,
                            backgroundColor: '#FFD700',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px #FFD700, 0 0 15px #FFD700',
                        }}
                    />
                );
            })}
        </div>
    );
};

const ProyectorView = ({ salirProyector }) => {
    const { votos } = useResultadosVotos();
    const { votacionActiva } = useVotaciones();
    const { categorias, loading } = useCategorias('admin');

    const [estado, setEstado] = useState('IDLE'); // 'IDLE', 'VOTING', 'CELEBRATING'
    const [catCongelada, setCatCongelada] = useState(null);

    useEffect(() => {
        if (loading) return;

        const categoriasActivasIds = Object.keys(votacionActiva).filter(k => votacionActiva[k] === true);
        if (categoriasActivasIds.length > 0) {
            const cat = categorias.find(c => c.id === categoriasActivasIds[0]);
            if (cat) {
                setEstado('VOTING');
                setCatCongelada(cat);
            }
        } else {
            // No hay votación activa en la BD.
            if (estado === 'VOTING' && catCongelada) {
                // Acaba de cerrarse
                setEstado('CELEBRATING');
                // A los 10 segundos vuelve al estado de espera
                const timer = setTimeout(() => {
                    setEstado('IDLE');
                    setCatCongelada(null);
                }, 10000);
                return () => clearTimeout(timer);
            } else if (estado !== 'CELEBRATING') {
                setEstado('IDLE');
                setCatCongelada(null);
            }
        }
    }, [votacionActiva, categorias, loading, estado, catCongelada]);

    if (loading) return <div style={pantallaCompleta}><h2 style={tituloNeonGiganteAtenuado}>Cargando...</h2></div>;

    // Calcular ranking con la categoría que está en pantalla (congelada si celebramos, activa si votamos)
    let candidatosRankeados = [];
    let totalVotos = 0;

    if (catCongelada && catCongelada.candidatos) {
        totalVotos = catCongelada.candidatos.reduce((acc, c) => acc + (votos[catCongelada.id]?.[c.nombre] || 0), 0);

        candidatosRankeados = [...catCongelada.candidatos].map((c) => {
            const v = votos[catCongelada.id]?.[c.nombre] || 0;
            return {
                ...c,
                votos: v,
                porcentaje: totalVotos === 0 ? 0 : Math.round((v / totalVotos) * 100)
            };
        }).sort((a, b) => b.votos - a.votos); // Mayor a menor
    }

    // Configuración visual del podio para el top 3
    let podiumVisual = [];
    if (candidatosRankeados.length > 0) {
        const top1 = { ...candidatosRankeados[0], rank: 1, baseHeight: 65, color: '#FFD700', isWinner: false }; // Oro
        const top2 = candidatosRankeados[1] ? { ...candidatosRankeados[1], rank: 2, baseHeight: 45, color: '#C0C0C0' } : null; // Plata
        const top3 = candidatosRankeados[2] ? { ...candidatosRankeados[2], rank: 3, baseHeight: 30, color: '#CD7F32' } : null; // Bronce

        if (estado === 'CELEBRATING') {
            top1.baseHeight = 85; 
            top1.isWinner = true;
            podiumVisual = [top1]; // Excluimos al 2do y 3ero para que framer-motion los borre
        } else {
            // El de la izquierda es el 2do, el centro el 1ro, el de la derecha el 3ro
            podiumVisual = [top2, top1, top3].filter(Boolean);
        }
    }

    return (
        <div style={pantallaCompleta}>
            <button onClick={salirProyector} style={btnCerrarStyle} title="Salir">✕</button>

            {estado === 'IDLE' && <LluviaEstrellas />}

            {estado !== 'IDLE' && catCongelada ? (
                <div style={contenidoCentral}>
                    <h1 style={tituloNeonGigante}>{catCongelada.titulo}</h1>
                    
                    {estado === 'CELEBRATING' && (
                        <motion.h2 
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }} 
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={subtituloGanador}
                        >
                            ★ ¡TENEMOS UN GANADOR! ★
                        </motion.h2>
                    )}

                    <div style={podiumContainer}>
                        <AnimatePresence>
                            {podiumVisual.map((candidato) => {
                                const heightPercent = candidato.baseHeight + (candidato.porcentaje * 0.25);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                                        transition={{
                                            type: "spring", stiffness: 100, damping: 20
                                        }}
                                        key={candidato.nombre}
                                        style={{ ...columnaCandidato, height: `${heightPercent}%` }}
                                    >
                                        <div style={avatarContainer}>
                                            <div style={{ 
                                                ...avatarStyle, 
                                                backgroundImage: candidato.photoUrl ? `url(${candidato.photoUrl})` : 'none', 
                                                border: `4px solid ${candidato.color}`,
                                                ...(candidato.isWinner ? winnerGlowStyle : {}) 
                                            }}>
                                            </div>
                                            {!candidato.isWinner && (
                                                <div style={{ ...badgeRanking, backgroundColor: candidato.color }}>
                                                    #{candidato.rank}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ 
                                            ...barraPilar, 
                                            backgroundColor: candidato.color, 
                                            boxShadow: candidato.isWinner ? `0 0 50px ${candidato.color}80` : `0 0 30px ${candidato.color}40`,
                                        }}>
                                            <div style={pilarContent}>
                                                <span style={textoVotos}>{candidato.votos}</span>
                                            </div>
                                        </div>
                                        <div style={{...nombrePodio, fontSize: candidato.isWinner ? '2.5rem' : '2rem'}}>{candidato.nombre}</div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {candidatosRankeados.length > 3 && estado !== 'CELEBRATING' && (
                        <div style={restoCandidatosRow}>
                            {candidatosRankeados.slice(3).map(c => (
                                <div key={c.nombre} style={miniTagCandidato}>
                                    <span>{c.nombre}</span>
                                    <strong>{c.votos} v</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div style={contenidoCentral}>
                    <h1 style={tituloNeonGiganteAtenuado}>Bienvenidos a la Gala</h1>
                    <p style={subtituloStyleAtenuado}>La próxima votación comenzará en breve...</p>
                    <div style={pulsarDecoration}></div>
                </div>
            )}
        </div>
    );
};

// --- ESTILOS ENORMES PARA PANTALLA GIGANTE ---

const pantallaCompleta = {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: '#0a0a0a', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    fontFamily: 'sans-serif', overflow: 'hidden', paddingBottom: '5vh',
    background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
};

const contenidoCentral = {
    width: '90%', maxWidth: '1400px',
    height: '90%',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '30px',
    zIndex: 10
};

const tituloNeonGigante = {
    color: '#7EC8E3', textShadow: '0 0 20px #4A90D9, 0 0 40px #4A90D9, 0 0 80px #4A90D9',
    fontSize: '4.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'
};

const subtituloGanador = {
    color: '#FFD700', fontSize: '3.5rem', margin: '15px 0 0 0', 
    textShadow: '0 0 20px #FFD700, 0 0 40px rgba(255, 215, 0, 0.5)',
    fontWeight: '900', letterSpacing: '5px', textAlign: 'center'
};

const tituloNeonGiganteAtenuado = {
    ...tituloNeonGigante, color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.5)', fontSize: '5rem', marginTop: '15vh'
};
const subtituloStyleAtenuado = { color: '#bbb', fontSize: '2rem', letterSpacing: '2px', fontWeight: '300' };

// --- PODIUM LAYOUT ---
const podiumContainer = {
    flex: 1, width: '100%',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '30px',
    marginTop: '20px'
};

const columnaCandidato = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
    width: '300px',
    padding: '0 10px'
};

const avatarContainer = {
    position: 'relative', marginBottom: '15px', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const avatarStyle = {
    width: '160px', height: '160px',
    borderRadius: '50%', backgroundColor: '#222',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    transition: 'all 0.5s ease'
};

const winnerGlowStyle = {
    width: '220px', height: '220px',
    boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.4)',
    border: '6px solid #FFD700'
};

const badgeRanking = {
    position: 'absolute', bottom: '-15px',
    padding: '5px 25px', borderRadius: '20px',
    color: '#000', fontWeight: '900', fontSize: '1.8rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    border: '3px solid #000'
};

const barraPilar = {
    width: '100%',
    flex: 1,
    minHeight: '100px', 
    borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center',
    paddingTop: '30px',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.2)', borderBottom: 'none'
};

const pilarContent = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
};

const textoVotos = {
    color: '#000', fontWeight: '900', fontSize: '3rem',
    textShadow: '0 2px 4px rgba(255,255,255,0.5)', lineHeight: 1
};

const nombrePodio = {
    color: '#fff', fontSize: '2rem', fontWeight: 'bold',
    marginTop: '20px', textShadow: '0px 0px 10px rgba(0,0,0,0.8)',
    textAlign: 'center', width: '100%', lineHeight: 1.2
};

const restoCandidatosRow = {
    display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px'
};

const miniTagCandidato = {
    backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '20px',
    color: '#fff', display: 'flex', gap: '10px', fontSize: '1.2rem',
    border: '1px solid rgba(255,255,255,0.2)'
};

const btnCerrarStyle = {
    position: 'absolute', top: '30px', right: '30px', backgroundColor: 'transparent',
    color: '#555', border: 'none', fontSize: '2rem', cursor: 'pointer', zIndex: 10000
};

const pulsarDecoration = {
    width: '150px', height: '150px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(0,0,0,0) 70%)',
    animation: 'pulse 4s infinite', marginTop: '50px'
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { opacity: 0.5; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0.5; transform: scale(0.95); }
  }
`;
if (typeof document !== 'undefined') {
    document.head.appendChild(styleSheet);
}

export default ProyectorView;

