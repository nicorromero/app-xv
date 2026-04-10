import { useState, useEffect } from 'react';
import { db } from './services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import Galeria from './components/Galeria';
import Votar from './components/Votar';
import Dj from './components/Dj';
import Resultados from './components/Resultados';


function App() {
  const [vista, setVista] = useState('votar');
  const [votos, setVotos] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [nuevaCancion, setNuevaCancion] = useState({ nombre: '', artista: '' });

  const [votacionActiva, setVotacionActiva] = useState(false);

  const categoriasYcandidatos = [
    { id: 'mejor_vestido', titulo: 'Mejor Vestido', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'mas_bailo_jovenes', titulo: 'El/La que más bailó (Jóvenes)', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'mas_bailo_adultos', titulo: 'El/La que más bailó (Adultos)', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'tomo_todo', titulo: 'El/La que se tomó todo', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'premio_xv', titulo: 'Premio Mis XV', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] }
  ];

  // --- ESCUCHA TIEMPO REAL (VOTOS Y DJ) ---
  useEffect(() => {
    // Escuchar estado de votación
    const unsubConfig = onSnapshot(doc(db, "configuracion", "estado_votacion"), (snapshot) => {
      if (snapshot.exists()) {
        setVotacionActiva(snapshot.data().activa);
      }
    });

    // Escuchar Votos (agrupados por categoría y candidato)
    const unsubVotos = onSnapshot(collection(db, "votos"), (snap) => {
      const counts = {};
      snap.forEach(doc => {
        const data = doc.data();
        const cat = data.categoria;
        const c = data.candidato;
        if (cat && c) {
          if (!counts[cat]) counts[cat] = {};
          counts[cat][c] = (counts[cat][c] || 0) + 1;
        }
      });
      setVotos(counts);
    });

    // Escuchar Pedidos DJ (Ordenados por los más nuevos primero)
    const qDj = query(collection(db, "pedidos_dj"), orderBy("timestamp", "desc"));
    const unsubDj = onSnapshot(qDj, (snap) => {
      setPedidos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubVotos(); unsubDj(); unsubConfig(); };
  }, []);

  // --- FUNCIONES ---
  const votar = async (categoriaId, candidato) => {
    await addDoc(collection(db, "votos"), {
      categoria: categoriaId,
      candidato: candidato,
      timestamp: serverTimestamp()
    });
    alert("¡Voto registrado!");
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
    alert("¡Pedido enviado al DJ!");
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
      {vista === 'votar' && <Votar categorias={categoriasYcandidatos} votar={votar} votacionActiva={votacionActiva} />}

      {/* SECCIÓN: DJ */}
      {vista === 'dj' && (
        <Dj
          nuevaCancion={nuevaCancion}
          setNuevaCancion={setNuevaCancion}
          enviarPedido={enviarPedido}
          pedidos={pedidos}
        />
      )}

      {/* SECCIÓN: RESULTADOS */}
      {vista === 'resultados' && <Resultados categorias={categoriasYcandidatos} votos={votos} />}

      {vista === 'fotos' && <Galeria />}
    </div>
  );
}

// ESTILOS
const btnNav = { backgroundColor: 'transparent', color: '#e0218a', border: '1px solid #e0218a', padding: '10px', margin: '5px', cursor: 'pointer', borderRadius: '20px' };

export default App;
