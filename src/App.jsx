import { useState, useEffect } from 'react';
import { db } from './services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import Galeria from './components/Galeria';


function App() {
  const [vista, setVista] = useState('votar');
  const [votos, setVotos] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [nuevaCancion, setNuevaCancion] = useState({ nombre: '', artista: '' });

  const candidatos = ["Tío Juan", "Marta Brillos", "Primo Lucas", "Abuela Rosa"];

  // --- ESCUCHA TIEMPO REAL (VOTOS Y DJ) ---
  useEffect(() => {
    // Escuchar Votos
    const unsubVotos = onSnapshot(collection(db, "votos"), (snap) => {
      const counts = {};
      snap.forEach(doc => {
        const c = doc.data().candidato;
        counts[c] = (counts[c] || 0) + 1;
      });
      setVotos(counts);
    });

    // Escuchar Pedidos DJ (Ordenados por los más nuevos primero)
    const qDj = query(collection(db, "pedidos_dj"), orderBy("timestamp", "desc"));
    const unsubDj = onSnapshot(qDj, (snap) => {
      setPedidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubVotos(); unsubDj(); };
  }, []);

  // --- FUNCIONES ---
  const votar = async (c) => {
    await addDoc(collection(db, "votos"), { candidato: c, timestamp: serverTimestamp() });
    alert("¡Voto registrado! ✨");
    setVista('resultados');
  };

  const enviarPedido = async (e) => {
    e.preventDefault();
    if (!nuevaCancion.nombre) return;
    await addDoc(collection(db, "pedidos_dj"), {
      ...nuevaCancion,
      timestamp: serverTimestamp()
    });
    setNuevaCancion({ nombre: '', artista: '' });
    alert("¡Pedido enviado al DJ! 🎧");
  };

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>

      {/* NAVEGACIÓN */}
      <nav style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setVista('votar')} style={btnNav}>Votar</button>
        <button onClick={() => setVista('dj')} style={btnNav}>Pedir Tema</button>
        <button onClick={() => setVista('resultados')} style={btnNav}>Resultados</button>
        <button onClick={() => setVista('fotos')} style={btnNav}>Fotos</button>
      </nav>

      {/* SECCIÓN: VOTAR */}
      {vista === 'votar' && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ color: '#e0218a' }}>👑 Mejor Vestido</h2>
          {candidatos.map(c => (
            <button key={c} onClick={() => votar(c)} style={btnVoto}>{c}</button>
          ))}
        </div>
      )}

      {/* SECCIÓN: DJ */}
      {vista === 'dj' && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ color: '#e0218a' }}>🎧 Pedile un tema al DJ</h2>
          <form onSubmit={enviarPedido} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              placeholder="Nombre de la canción"
              value={nuevaCancion.nombre}
              onChange={(e) => setNuevaCancion({ ...nuevaCancion, nombre: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Artista"
              value={nuevaCancion.artista}
              onChange={(e) => setNuevaCancion({ ...nuevaCancion, artista: e.target.value })}
              style={inputStyle}
            />
            <button type="submit" style={btnVoto}>Enviar Pedido</button>
          </form>

          <h3 style={{ marginTop: '30px' }}>Pedidos Recientes:</h3>
          <div style={{ textAlign: 'left' }}>
            {pedidos.map(p => (
              <p key={p.id} style={{ borderBottom: '1px solid #333', padding: '5px' }}>
                🎵 <strong>{p.nombre}</strong> - {p.artista}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN: RESULTADOS */}
      {vista === 'resultados' && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: '#e0218a' }}>📊 Resultados en Vivo</h2>
          {candidatos.map(c => {
            const count = votos[c] || 0;
            const total = Object.values(votos).reduce((a, b) => a + b, 0);
            const porc = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={c} style={{ marginBottom: '15px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{c}</span><span>{count}</span></div>
                <div style={{ backgroundColor: '#333', height: '10px', borderRadius: '5px' }}>
                  <div style={{ width: `${porc}%`, backgroundColor: '#e0218a', height: '100%', borderRadius: '5px', transition: '0.5s' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vista === 'fotos' && <Galeria />}
    </div>
  );
}

// ESTILOS
const btnNav = { backgroundColor: 'transparent', color: '#e0218a', border: '1px solid #e0218a', padding: '10px', margin: '5px', cursor: 'pointer', borderRadius: '20px' };
const btnVoto = { backgroundColor: '#e0218a', color: 'white', border: 'none', padding: '15px', margin: '5px', cursor: 'pointer', borderRadius: '10px', width: '100%', fontWeight: 'bold' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: 'white' };

export default App;
