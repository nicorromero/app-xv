import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import AdminTrigger from './AdminTrigger';
import { useAuth } from '../context/AuthContext';

const containerStyle = { maxWidth: '500px', margin: '0 auto', textAlign: 'center' };
const titleStyle = { color: '#ffb3ff', textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', fontFamily: 'sans-serif', margin: '20px 0' };
const btnVoto = { backgroundColor: 'transparent', color: '#ffccff', border: '2px solid #ff1aff', padding: '15px', margin: '10px 0', cursor: 'pointer', borderRadius: '15px', width: '100%', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)', transition: 'all 0.3s ease' };
const boxStyle = { background: 'rgba(255, 0, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '15px', marginBottom: '15px', backdropFilter: 'blur(5px)', boxShadow: '0 4px 15px rgba(255, 0, 255, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' };
const lockedTitleStyle = { color: '#fff', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 0 5px rgba(255, 255, 255, 0.5)' };

function Votar({ categorias, votar, votacionActiva }) {
  const { isAdmin } = useAuth();
  const [catSeleccionada, setCatSeleccionada] = useState(null);

  const toggleCategoria = async (catId) => {
    try {
        const isCurrentActive = votacionActiva[catId] === true;
        // merge: true permite actualizar solo esta categoría sin borrar el resto
        await setDoc(doc(db, "configuracion", "estado_votacion"), { [catId]: !isCurrentActive }, { merge: true });
    } catch (e) {
        console.error("Error cambiando estado:", e);
    }
  };

  const categoriasActivas = categorias.filter(cat => votacionActiva[cat.id] === true);
  const isForcedClient = !isAdmin && categoriasActivas.length > 0;
  const categoriaARenderizar = isForcedClient ? categoriasActivas[0] : catSeleccionada;

  if (categoriaARenderizar) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>{categoriaARenderizar.titulo}</h2>
        <p style={{ color: '#fff', marginBottom: '20px', fontSize: '16px' }}>Elegí a tu favorito:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoriaARenderizar.candidatos.map(c => (
            <button 
              key={c} 
              onClick={() => {
                votar(categoriaARenderizar.id, c);
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
        <h2 style={titleStyle}>✨ Votación Oficial ✨</h2>
      </AdminTrigger>
      
      <p style={{ color: '#fff', marginBottom: '25px', fontSize: '16px' }}>
        ¡Selecciona una categoría habilitada para elegir a tu favorito!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {categorias.map(cat => {
          // Chequeamos si esta categoría puntual está activa
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
                  if(isCatActive) { 
                    e.target.style.backgroundColor = 'rgba(255, 0, 255, 0.3)'; 
                    e.target.style.color = '#fff'; 
                    e.target.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8)'; 
                    e.target.style.transform = 'scale(1.02)'; 
                  } 
                }}
                onMouseOut={(e) => { 
                  if(isCatActive) { 
                    e.target.style.backgroundColor = 'transparent'; 
                    e.target.style.color = '#ffccff'; 
                    e.target.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)'; 
                    e.target.style.transform = 'scale(1)'; 
                  } 
                }}
              >
                {isCatActive ? <span>{cat.titulo}</span> : <span>🔒 {cat.titulo}</span>}
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

export default Votar;
