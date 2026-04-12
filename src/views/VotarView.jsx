import React, { useState } from 'react';
import AdminTrigger from '../components/AdminTrigger';
import { useAuth } from '../context/AuthContext';
import { useVotaciones } from '../hooks/useVotaciones';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { categoriasYcandidatos as categorias } from '../config/categorias';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const containerStyle = {
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  padding: '0 4px',
  textAlign: 'center'
};
const titleStyle = {
  color: '#ffb3ff',
  textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
  fontFamily: 'sans-serif',
  margin: '20px 0',
  fontSize: 'clamp(20px, 5vw, 28px)'
};
const btnVoto = {
  backgroundColor: 'transparent',
  color: '#ffccff',
  border: '2px solid #ff1aff',
  padding: '16px 12px',
  margin: '8px 0',
  cursor: 'pointer',
  borderRadius: '15px',
  width: '100%',
  fontWeight: 'bold',
  fontSize: 'clamp(14px, 4vw, 16px)',
  boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)',
  transition: 'all 0.3s ease'
};
const boxStyle = {
  background: 'rgba(255, 0, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '20px 16px',
  borderRadius: '15px',
  marginBottom: '15px',
  backdropFilter: 'blur(5px)',
  boxShadow: '0 4px 15px rgba(255, 0, 255, 0.2)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80px'
};

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

  if (categoriaARenderizar) {
    const yaVoto = localStorage.getItem(`voto_${categoriaARenderizar.id}`) === 'true' || votoTemporal === categoriaARenderizar.id;

    if (yaVoto && !isAdmin) {
      return (
        <div style={containerStyle}>
          <h2 style={titleStyle}>{categoriaARenderizar.titulo}</h2>
          <div style={{ ...boxStyle, flexDirection: 'column', padding: '40px 20px', backgroundColor: 'rgba(255, 0, 255, 0.15)', borderColor: '#ff1aff', boxShadow: '0 0 30px rgba(255,0,255,0.5)' }}>
            <h3 style={{ color: '#fff', fontSize: '24px', margin: '0 0 15px 0', textShadow: '0 0 10px #ff00ff' }}>
              {isOnline ? '¡Voto Registrado! 🎟️' : '¡Voto Guardado en tu celular! 🎟️'}
            </h3>
            <p style={{ color: '#ffccff', fontSize: '16px', margin: 0 }}>
              {isOnline
                ? 'Presten atención a la pantalla gigante para ver los resultados en vivo.'
                : 'Pusimos tu voto en cola local. Se enviará automáticamente a la pantalla gigante apenas recuperes la señal.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>{categoriaARenderizar.titulo}</h2>
        <p style={{ color: '#fff', marginBottom: '20px', fontSize: '16px' }}>Elegí a tu favorito:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              style={btnVoto}
              onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 0, 255, 0.2)'; e.target.style.transform = 'scale(1.05)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
            >
              {c}
            </button>
          ))}
        </div>
        {!isForcedClient && (
          <button
            onClick={() => setCatSeleccionada(null)}
            style={{ ...btnVoto, border: '1px solid #777', color: '#ccc', boxShadow: 'none', marginTop: '30px', padding: '10px' }}
            onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
          >
            ← Volver a categorías
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <AdminTrigger>
        <h2 style={titleStyle}> Premios de la Noche </h2>
      </AdminTrigger>

      <p style={{ color: '#fff', marginBottom: '25px', fontSize: '16px' }}>
        ¡Anda pensando en tu favorito!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {categorias.map(cat => {
          const isCatActive = votacionActiva[cat.id] === true;

          return (
            <div key={cat.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  if (isCatActive) setCatSeleccionada(cat);
                }}
                style={{
                  ...btnVoto,
                  margin: '0',
                  flex: 1,
                  cursor: isCatActive ? 'pointer' : 'not-allowed',
                  backgroundColor: isCatActive ? 'transparent' : 'rgba(255, 0, 255, 0.05)',
                  borderColor: isCatActive ? '#ff1aff' : '#a300cc',
                  color: isCatActive ? '#ffccff' : '#e680ff',
                  boxShadow: isCatActive ? '0 0 15px rgba(255, 0, 255, 0.6)' : '0 0 5px rgba(255, 0, 255, 0.2)'
                }}
                onMouseOver={(e) => {
                  if (isCatActive) {
                    e.target.style.backgroundColor = 'rgba(255, 0, 255, 0.3)';
                    e.target.style.color = '#fff';
                    e.target.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8)';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseOut={(e) => {
                  if (isCatActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#ffccff';
                    e.target.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {isCatActive ? <span>{cat.titulo}</span> : <span> {cat.titulo}</span>}
              </button>

              {isAdmin && (
                <button
                  onClick={() => toggleCategoria(cat.id)}
                  style={{
                    padding: '15px 10px',
                    borderRadius: '15px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: isCatActive ? 'rgba(255,0,0,0.6)' : 'rgba(0,255,0,0.6)',
                    color: 'white',
                    minWidth: '80px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
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

export default VotarView;
