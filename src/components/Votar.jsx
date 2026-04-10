import React, { useState } from 'react';

const containerStyle = { maxWidth: '500px', margin: '0 auto', textAlign: 'center' };
const titleStyle = { color: '#ffb3ff', textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', fontFamily: 'sans-serif', margin: '20px 0' };
const btnVoto = { backgroundColor: 'transparent', color: '#ffccff', border: '2px solid #ff1aff', padding: '15px', margin: '10px 0', cursor: 'pointer', borderRadius: '15px', width: '100%', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)', transition: 'all 0.3s ease' };
const boxStyle = { background: 'rgba(255, 0, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '15px', marginBottom: '15px', backdropFilter: 'blur(5px)', boxShadow: '0 4px 15px rgba(255, 0, 255, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' };
const lockedTitleStyle = { color: '#fff', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 0 5px rgba(255, 255, 255, 0.5)' };

function Votar({ categorias, votar, votacionActiva }) {
  const [catSeleccionada, setCatSeleccionada] = useState(null);

  if (!votacionActiva) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>✨ Las Categorías de la Noche ✨</h2>
        <p style={{ color: '#fff', marginBottom: '25px', fontSize: '15px', fontStyle: 'italic', letterSpacing: '0.5px' }}>
          Las votaciones aún no están abiertas. ¡Ve pensando a tus favoritos para estos premios!
        </p>
        <div style={{ display: 'grid', gap: '15px' }}>
          {categorias.map(cat => (
            <div key={cat.id} style={boxStyle}>
              <span style={lockedTitleStyle}>👑 {cat.titulo}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (catSeleccionada) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>{catSeleccionada.titulo}</h2>
        <p style={{ color: '#fff', marginBottom: '20px', fontSize: '16px' }}>Elegí a tu favorito:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {catSeleccionada.candidatos.map(c => (
            <button 
              key={c} 
              onClick={() => {
                votar(catSeleccionada.id, c);
                setCatSeleccionada(null); // Resetea para la proxima vez
              }} 
              style={btnVoto}
              onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 0, 255, 0.2)'; e.target.style.transform = 'scale(1.05)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
            >
              {c}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setCatSeleccionada(null)} 
          style={{ ...btnVoto, border: '1px solid #777', color: '#ccc', boxShadow: 'none', marginTop: '30px', padding: '10px' }}
          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
        >
          ← Volver a categorías
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>💖 Votación Oficial 💖</h2>
      <p style={{ color: '#fff', marginBottom: '25px', fontSize: '16px' }}>¡Selecciona una categoría para votar a tu fav!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {categorias.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setCatSeleccionada(cat)} 
            style={btnVoto}
            onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 0, 255, 0.3)'; e.target.style.color = '#fff'; e.target.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8)'; e.target.style.transform = 'scale(1.02)'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ffccff'; e.target.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.4)'; e.target.style.transform = 'scale(1)'; }}
          >
            {cat.titulo}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Votar;
