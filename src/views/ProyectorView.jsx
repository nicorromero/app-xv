import React from 'react';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { categoriasYcandidatos } from '../config/categorias';
import { useVotaciones } from '../hooks/useVotaciones';

const ProyectorView = ({ salirProyector }) => {
    const { votos } = useResultadosVotos();
    const { votacionActiva } = useVotaciones();

    // Buscar qué categoría está abierta actualmente
    const categoriasActivasIds = Object.keys(votacionActiva).filter(k => votacionActiva[k] === true);
    let catActiva = null;
    
    if (categoriasActivasIds.length > 0) {
        catActiva = categoriasYcandidatos.find(c => c.id === categoriasActivasIds[0]);
    }

    return (
        <div style={pantallaCompleta}>
            
            {/* BOTÓN SECRETO PARA CERRAR EL PROYECTOR (ARRIBA DERECHA) */}
            <button 
                onClick={salirProyector} 
                style={btnCerrarStyle}
                title="Salir del Modo Proyector"
            >
                ✕
            </button>

            {catActiva ? (
                // MODO ACTIVO: MOSTRAR RESULTADOS EN TIEMPO REAL
                <div style={contenidoCentral}>
                    <h1 style={tituloNeonGigante}>{catActiva.titulo}</h1>
                    <p style={subtituloStyle}>Resultados en vivo...</p>
                    
                    <div style={graficosContainer}>
                        {catActiva.candidatos.map(candidato => {
                            const votosCandidato = votos[catActiva.id]?.[candidato] || 0;
                            const totalVotos = catActiva.candidatos.reduce((acc, c) => acc + (votos[catActiva.id]?.[c] || 0), 0);
                            const porcentaje = totalVotos === 0 ? 0 : Math.round((votosCandidato / totalVotos) * 100);
                            
                            return (
                                <div key={candidato} style={filaCandidato}>
                                    <div style={nombreCandidato}>{candidato}</div>
                                    <div style={barraFondo}>
                                        <div style={{...barraRelleno, width: `${porcentaje}%`}}>
                                            <span style={textoPorcentaje}>{votosCandidato} votos ({porcentaje}%)</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // MODO ESPERA (STANDBY)
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
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'sans-serif',
    overflow: 'hidden'
};

const contenidoCentral = {
    width: '80%',
    maxWidth: '1200px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px'
};

const tituloNeonGigante = {
    color: '#7EC8E3', 
    textShadow: '0 0 20px #4A90D9, 0 0 40px #4A90D9, 0 0 80px #4A90D9', 
    fontSize: '5rem',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '3px'
};

const subtituloStyle = {
    color: '#4682B4',
    fontSize: '2rem',
    margin: 0,
    textShadow: '0 0 10px rgba(70, 130, 180, 0.8)',
    animation: 'pulse 2s infinite'
};

const tituloNeonGiganteAtenuado = {
    ...tituloNeonGigante,
    color: '#4682B4',
    textShadow: '0 0 10px #4682B4',
    textShadow: '0 0 10px #0D1B2A',
    fontSize: '4rem'
};

const subtituloStyleAtenuado = {
    color: '#666',
    fontSize: '1.5rem'
};

const graficosContainer = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    marginTop: '30px'
};

const filaCandidato = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%'
};

const nombreCandidato = {
    color: '#fff',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '0px 0px 5px rgba(255,255,255,0.5)'
};

const barraFondo = {
    width: '100%',
    height: '60px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
};

const barraRelleno = {
    height: '100%',
    backgroundColor: '#4A90D9',
    boxShadow: '0 0 20px #4A90D9, inset 0 0 10px rgba(255,255,255,0.5)',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
    paddingRight: '20px',
    boxSizing: 'border-box',
    minWidth: '5%'
};

const textoPorcentaje = {
    color: '#fff',
    fontWeight: '900',
    fontSize: '1.5rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
};

const btnCerrarStyle = {
    position: 'absolute',
    top: '30px',
    right: '30px',
    backgroundColor: 'transparent',
    color: '#555',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    zIndex: 10000
};

const pulsarDecoration = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,0,255,0.2) 0%, rgba(0,0,0,0) 70%)',
    animation: 'pulse 4s infinite'
};

const styleSheet = document.createElement("style")
styleSheet.innerText = `
  @keyframes pulse {
    0% { opacity: 0.5; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0.5; transform: scale(0.95); }
  }
`
if (typeof document !== 'undefined') {
    document.head.appendChild(styleSheet);
}

export default ProyectorView;
