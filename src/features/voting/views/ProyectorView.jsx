import React from 'react';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { useCategorias } from '../hooks/useCategorias';
import { useVotaciones } from '../hooks/useVotaciones';
import { motion, AnimatePresence } from 'framer-motion';

const ProyectorView = ({ salirProyector }) => {
    const { votos } = useResultadosVotos();
    const { votacionActiva } = useVotaciones();
    const { categorias, loading } = useCategorias('admin');

    if (loading) return <div style={pantallaCompleta}><h2 style={tituloNeonGiganteAtenuado}>Cargando...</h2></div>;

    // Buscar qué categoría está activa
    const categoriasActivasIds = Object.keys(votacionActiva).filter(k => votacionActiva[k] === true);
    let catActiva = null;
    if (categoriasActivasIds.length > 0) {
        catActiva = categorias.find(c => c.id === categoriasActivasIds[0]);
    }

    // Calcular ranking si hay categoría activa
    let candidatosRankeados = [];
    let totalVotos = 0;

    if (catActiva && catActiva.candidatos) {
        totalVotos = catActiva.candidatos.reduce((acc, c) => acc + (votos[catActiva.id]?.[c.nombre] || 0), 0);

        candidatosRankeados = [...catActiva.candidatos].map((c) => {
            const v = votos[catActiva.id]?.[c.nombre] || 0;
            return {
                ...c,
                votos: v,
                porcentaje: totalVotos === 0 ? 0 : Math.round((v / totalVotos) * 100)
            };
        }).sort((a, b) => b.votos - a.votos); // Mayor a menor
    }

    // Configuración visual del podio para el top 3
    // Renderizamos en el orden flex: [Segundo, Primero, Tercero]
    let podiumVisual = [];
    if (candidatosRankeados.length > 0) {
        const top1 = { ...candidatosRankeados[0], rank: 1, baseHeight: 65, color: '#FFD700' }; // Oro
        const top2 = candidatosRankeados[1] ? { ...candidatosRankeados[1], rank: 2, baseHeight: 45, color: '#C0C0C0' } : null; // Plata
        const top3 = candidatosRankeados[2] ? { ...candidatosRankeados[2], rank: 3, baseHeight: 30, color: '#CD7F32' } : null; // Bronce

        // El de la izquierda es el 2do, el centro el 1ro, el de la derecha el 3ro
        podiumVisual = [top2, top1, top3].filter(Boolean);
    }

    return (
        <div style={pantallaCompleta}>
            <button onClick={salirProyector} style={btnCerrarStyle} title="Salir">✕</button>

            {catActiva ? (
                <div style={contenidoCentral}>
                    <h1 style={tituloNeonGigante}>{catActiva.titulo}</h1>
                    <p style={subtituloStyle}>Resultados en vivo...</p>

                    <div style={podiumContainer}>
                        <AnimatePresence>
                            {podiumVisual.map((candidato) => {
                                // La altura dinámica = Altura base del podio + un pequeño extra por su porcentaje para darle dinamismo
                                // Se calcula en % respecto al contenedor
                                const heightPercent = candidato.baseHeight + (candidato.porcentaje * 0.25);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20
                                        }}
                                        key={candidato.nombre}
                                        style={{ ...columnaCandidato, height: `${heightPercent}%` }}
                                    >
                                        <div style={avatarContainer}>
                                            <div style={{ ...avatarStyle, backgroundImage: candidato.photoUrl ? `url(${candidato.photoUrl})` : 'none', border: `4px solid ${candidato.color}` }}>
                                                {!candidato.photoUrl && <span style={{ fontSize: '2rem' }}>👤</span>}
                                            </div>
                                            <div style={{ ...badgeRanking, backgroundColor: candidato.color }}>
                                                #{candidato.rank}
                                            </div>
                                        </div>

                                        <div style={{ ...barraPilar, backgroundColor: candidato.color, boxShadow: `0 0 30px ${candidato.color}40` }}>
                                            <div style={pilarContent}>
                                                <span style={textoVotos}>{candidato.votos}</span>
                                                <span style={textoPorcentaje}>{candidato.porcentaje}%</span>
                                            </div>
                                        </div>
                                        <div style={nombrePodio}>{candidato.nombre}</div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {candidatosRankeados.length > 3 && (
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
                    <h1 style={tituloNeonGiganteAtenuado}>¡Se viene un premio!</h1>
                    <p style={subtituloStyleAtenuado}>Prepará tu celular para votar...</p>
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
    gap: '30px'
};

const tituloNeonGigante = {
    color: '#7EC8E3', textShadow: '0 0 20px #4A90D9, 0 0 40px #4A90D9, 0 0 80px #4A90D9',
    fontSize: '4.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center'
};

const subtituloStyle = {
    color: '#4682B4', fontSize: '2rem', margin: 0, textShadow: '0 0 10px rgba(70, 130, 180, 0.8)',
    animation: 'pulse 2s infinite'
};

const tituloNeonGiganteAtenuado = {
    ...tituloNeonGigante, color: '#4682B4', textShadow: '0 0 10px #0D1B2A', fontSize: '4rem', marginTop: '15vh'
};
const subtituloStyleAtenuado = { color: '#666', fontSize: '1.5rem' };

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
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
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
    minHeight: '100px', // Evita que colapse a 0
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

const textoPorcentaje = {
    color: '#333', fontWeight: '700', fontSize: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.4)', padding: '5px 15px', borderRadius: '20px'
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
    background: 'radial-gradient(circle, rgba(255,0,255,0.2) 0%, rgba(0,0,0,0) 70%)',
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
