import React from 'react';

function Resultados({ categorias, votos }) {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', paddingBottom: '30px' }}>
      <h2 style={{ color: '#ffb3ff', textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', fontFamily: 'sans-serif', margin: '20px 0 30px' }}>
        📊 Resultados en Vivo
      </h2>
      
      {categorias.map(cat => {
        const votosCategoria = votos[cat.id] || {};
        const totalVotosCat = Object.values(votosCategoria).reduce((a, b) => a + b, 0);

        return (
          <div key={cat.id} style={{ marginBottom: '25px', background: 'rgba(255, 0, 255, 0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,0,255,0.2)' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px', textAlign: 'left', borderBottom: '1px solid #ff1aff', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              👑 {cat.titulo}
            </h3>
            
            {cat.candidatos.map(c => {
              const count = votosCategoria[c] || 0;
              const porc = totalVotosCat > 0 ? (count / totalVotosCat) * 100 : 0;
              return (
                <div key={c} style={{ marginBottom: '15px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '15px', marginBottom: '6px' }}>
                    <span>{c}</span>
                    <span style={{ fontWeight: 'bold', color: '#ffccff' }}>{count} ({Math.round(porc)}%)</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                    <div style={{ width: `${porc}%`, background: 'linear-gradient(90deg, #ff00ff, #ffb3ff)', height: '100%', borderRadius: '7px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
              );
            })}
            
            {totalVotosCat === 0 && (
              <p style={{ color: '#aaa', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', marginTop: '10px' }}>Sin votos registrados aún.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Resultados;
