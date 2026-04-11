import React from 'react';

const Proyector = ({ categorias, votos, votacionActiva, salirProyector }) => {

    // Buscar qué categoría está abierta actualmente
    const categoriasActivasIds = Object.keys(votacionActiva).filter(k => votacionActiva[k] === true);
    let catActiva = null;
    
    if (categoriasActivasIds.length > 0) {
        catActiva = categorias.find(c => c.id === categoriasActivasIds[0]);
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
                    
                    {/* Elemento de diseño de luces apagadas (decorativo) */}
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
    color: '#ffb3ff', 
    textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 80px #ff00ff', 
    fontSize: '5rem',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '3px'
};

const subtituloStyle = {
    color: '#00ffcc',
    fontSize: '2rem',
    margin: 0,
    textShadow: '0 0 10px rgba(0, 255, 204, 0.8)',
    animation: 'pulse 2s infinite'
};

const tituloNeonGiganteAtenuado = {
    ...tituloNeonGigante,
    color: '#8a008a',
    textShadow: '0 0 10px #4d004d',
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
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' // profundidad interior
};

const barraRelleno = {
    height: '100%',
    backgroundColor: '#ff1aff',
    boxShadow: '0 0 20px #ff1aff, inset 0 0 10px rgba(255,255,255,0.5)', // Brillo espectacular
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', // Animación fluida de crecimiento
    paddingRight: '20px',
    boxSizing: 'border-box',
    minWidth: '5%' // para que se vea un poquito al 0%
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

// Decoración animada simple
const pulsarDecoration = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,0,255,0.2) 0%, rgba(0,0,0,0) 70%)',
    animation: 'pulse 4s infinite'
};

// Inyectamos una mini hoja de estilos para la animación (pulse)
const styleSheet = document.createElement("style")
styleSheet.innerText = `
  @keyframes pulse {
    0% { opacity: 0.5; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0.5; transform: scale(0.95); }
  }
`
document.head.appendChild(styleSheet);


export default Proyector;
