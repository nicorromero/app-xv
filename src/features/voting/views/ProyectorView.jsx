import React, { useState, useEffect, useRef } from 'react';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { useCategorias } from '../hooks/useCategorias';
import { useVotaciones } from '../hooks/useVotaciones';
import { useImagePreloader } from '../../../hooks/useImagePreloader';
import { AnimatePresence, motion } from 'framer-motion';
import LluviaEstrellas from '../components/LluviaEstrellas';
import { getOptimizedUrl } from '../../../utils/cloudinaryUtils';

const ProyectorView = ({ salirProyector }) => {
    const { votacionActiva } = useVotaciones();
    const { categorias, loading } = useCategorias('admin');
    const { preloadBatch } = useImagePreloader();

    // Inyectar estilos globales de animación con cleanup al desmontar
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.innerText = `
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.5; transform: scale(0.95); }
          }
        `;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    const [estado, setEstado] = useState('IDLE'); // 'IDLE', 'VOTING', 'CELEBRATING'
    const [catCongelada, setCatCongelada] = useState(null);
    const orderRef = useRef([]); // Guarda el orden visual previo para resolver empates sin que "salten"

    const { votos } = useResultadosVotos(catCongelada?.id);

    // Precargar todas las fotos de los candidatos
    useEffect(() => {
        if (categorias && categorias.length > 0) {
            const urls = categorias.flatMap(cat => 
                (cat.candidatos || []).map(c => c.photoUrl).filter(Boolean)
            );
            preloadBatch(urls.map(getOptimizedUrl));
        }
    }, [categorias, preloadBatch]);

    useEffect(() => {
        if (loading) return;

        const categoriasActivasIds = Object.keys(votacionActiva).filter(k => votacionActiva[k] === true);
        if (categoriasActivasIds.length > 0) {
            const cat = categorias.find(c => c.id === categoriasActivasIds[0]);
            if (cat) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
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
                    orderRef.current = []; // Limpiamos el historial al reiniciar
                }, 10000);
                return () => clearTimeout(timer);
            } else if (estado !== 'CELEBRATING') {
                setEstado('IDLE');
                setCatCongelada(null);
                orderRef.current = [];
            }
        }
    }, [votacionActiva, categorias, loading, estado, catCongelada]);

    if (loading) return <div style={pantallaCompleta}><h2 style={tituloNeonGiganteAtenuado}>Cargando...</h2></div>;

    // Calcular ranking con la categoría que está en pantalla (congelada si celebramos, activa si votamos)
    let candidatosRankeados = [];
    let totalVotos = 0;

    if (catCongelada && catCongelada.candidatos) {
        totalVotos = catCongelada.candidatos.reduce((acc, c) => acc + (votos[catCongelada.id]?.[c.nombre] || 0), 0);

        // Agregamos originalIndex para garantizar "Stable Sort" en caso de empate
        const conVotos = [...catCongelada.candidatos].map((c, index) => {
            const v = votos[catCongelada.id]?.[c.nombre] || 0;
            return {
                ...c,
                votos: v,
                porcentaje: totalVotos === 0 ? 0 : Math.round((v / totalVotos) * 100),
                originalIndex: index
            };
        });

        // Ordenar por votos, y si hay empate, usar quien estaba más alto en el render anterior
        const sorted = conVotos.sort((a, b) => {
            if (b.votos !== a.votos) return b.votos - a.votos;
            
            const posA = orderRef.current.indexOf(a.nombre);
            const posB = orderRef.current.indexOf(b.nombre);
            
            // Si ambos ya estaban en el historial, el que estaba primero se queda con el puesto (True Stable Sort)
            if (posA !== -1 && posB !== -1) {
                return posA - posB;
            }
            
            return a.originalIndex - b.originalIndex;
        });

        // Guardamos el nuevo orden para el próximo render
        orderRef.current = sorted.map(c => c.nombre);

        // Asignar Ranking Denso Matemático (1, 1, 2, 3...)
        let currentRank = 1;
        let currentVotes = sorted[0]?.votos || 0;

        candidatosRankeados = sorted.map((c, i) => {
            // Efecto visual: Si nadie votó aún, forzamos ranks 1, 2, 3 para dibujar el podio escalonado
            if (totalVotos === 0) {
                return { ...c, rank: i + 1 };
            }

            if (c.votos < currentVotes) {
                currentRank++;
                currentVotes = c.votos;
            }
            return { ...c, rank: currentRank };
        });
    }

    // Configuración visual del podio para el top 3
    let podiumVisual = [];
    if (candidatosRankeados.length > 0) {
        const AZUL_GALA   = '#00C8FF';
        const AZUL_GALA_2 = '#0090D8';
        const AZUL_GALA_3 = '#005FA3';
        const isCelebrating = estado === 'CELEBRATING';

        const rankStyles = {
            1: { baseHeight: isCelebrating ? 85 : 65, color: isCelebrating ? '#FFD700' : AZUL_GALA, isWinner: isCelebrating, isLoser: false },
            2: { baseHeight: isCelebrating ? 50 : 45, color: isCelebrating ? '#C0C0C0' : AZUL_GALA_2, isWinner: false, isLoser: isCelebrating },
            3: { baseHeight: isCelebrating ? 35 : 30, color: isCelebrating ? '#CD7F32' : AZUL_GALA_3, isWinner: false, isLoser: isCelebrating }
        };

        const applyStyle = (candidato) => {
            if (!candidato) return null;
            // Si hay empates en puestos bajos (>3), les damos el estilo del 3er puesto
            const style = rankStyles[candidato.rank] || rankStyles[3];
            return { ...candidato, ...style };
        };

        const top1 = applyStyle(candidatosRankeados[0]);
        const top2 = applyStyle(candidatosRankeados[1]);
        const top3 = applyStyle(candidatosRankeados[2]);

        // Orden visual: 2° | 1° | 3° (podio clásico centrado)
        podiumVisual = [top2, top1, top3].filter(Boolean);
    }

    return (
        <div style={pantallaCompleta}>
            <button onClick={salirProyector} style={btnCerrarStyle} title="Salir">✕</button>

            {estado === 'IDLE' && <LluviaEstrellas />}

            {estado !== 'IDLE' && catCongelada ? (
                <div style={contenidoCentral}>
                    {estado !== 'CELEBRATING' && <h1 style={tituloNeonGigante}>{catCongelada.titulo}</h1>}
                    
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
                                        key={candidato.nombre}
                                        initial={{ opacity: 0, y: 100, height: '0%' }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            height: `${heightPercent}%`,
                                        }}
                                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                                        transition={{
                                            type: 'spring', stiffness: 80, damping: 18,
                                            height: { type: 'spring', stiffness: 60, damping: 20 }
                                        }}
                                        style={columnaCandidato}
                                    >
                                        <div style={avatarContainer}>
                                            <div style={{
                                                ...avatarStyle,
                                                backgroundImage: candidato.photoUrl ? `url(${getOptimizedUrl(candidato.photoUrl)})` : 'none',
                                                border: `4px solid ${candidato.color}`,
                                                ...(candidato.isWinner ? winnerGlowStyle : {}),
                                            }} />

                                            {/* Conteo de votos crudo */}
                                            <motion.span
                                                animate={{
                                                    opacity: candidato.isLoser ? 0.45 : 1,
                                                }}
                                                transition={{ duration: 0.6 }}
                                                style={{
                                                    marginTop: '10px',
                                                    fontSize: candidato.isWinner ? '2.6rem' : '2rem',
                                                    fontWeight: '900',
                                                    color: '#fff',
                                                    textShadow: `0 0 14px ${candidato.color}, 0 0 30px ${candidato.color}80`,
                                                    letterSpacing: '2px',
                                                    lineHeight: 1,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {candidato.votos}
                                            </motion.span>
                                        </div>

                                        <motion.div
                                            animate={{
                                                opacity: candidato.isLoser ? 0.4 : 1,
                                                filter: candidato.isLoser ? 'grayscale(0.6)' : 'grayscale(0)',
                                            }}
                                            transition={{ duration: 0.8 }}
                                            style={{
                                                ...barraPilar,
                                                backgroundColor: candidato.color,
                                                boxShadow: candidato.isWinner
                                                    ? `0 0 60px ${candidato.color}, 0 0 120px ${candidato.color}60`
                                                    : `0 0 40px ${candidato.color}90, 0 0 80px ${candidato.color}40`,
                                            }}
                                        >
                                            <div style={pilarContent}>
                                                <span style={{ ...textoVotos, fontSize: '2.2rem', textAlign: 'center', padding: '0 10px', wordBreak: 'break-word' }}>
                                                    {candidato.nombre}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Candidatos fuera del top 3: ocultar en CELEBRATING para no distraer */}
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
};

const winnerGlowStyle = {
    width: '220px', height: '220px',
    boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.4)',
    border: '6px solid #FFD700'
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

export default ProyectorView;

