import { useState, useEffect } from 'react';
import { db } from './services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';
import { auth } from './services/firebaseConfig';
import Galeria from './components/Galeria';
import Votar from './components/Votar';
import Dj from './components/Dj';
import Resultados from './components/Resultados';
import Proyector from './components/Proyector';


function App() {
  const [vista, setVista] = useState('votar');
  const [isProyector, setIsProyector] = useState(false);
  const [votos, setVotos] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [nuevaCancion, setNuevaCancion] = useState({ nombre: '', artista: '' });

  const [votacionActiva, setVotacionActiva] = useState({});
  const { isAdmin } = useAuth();

  const categoriasYcandidatos = [
    { id: 'mejor_vestido', titulo: 'Mejor Vestido', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'mas_bailo_jovenes', titulo: 'El/La que más bailó (Jóvenes)', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'mas_bailo_adultos', titulo: 'El/La que más bailó (Adultos)', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'tomo_todo', titulo: 'El/La que se tomó todo', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] },
    { id: 'premio_xv', titulo: 'Premio Mis XV', candidatos: ['Candidato 1', 'Candidato 2', 'Candidato 3'] }
  ];

  // --- ESCUCHA TIEMPO REAL (VOTOS Y DJ) ---
  useEffect(() => {
    // Escuchar estado de votación por categoría
    const unsubConfig = onSnapshot(doc(db, "configuracion", "estado_votacion"), (snapshot) => {
      if (snapshot.exists()) {
        // Guarda el estado de cada categoría, ej: { "mejor_vestido": true, "tomo_todo": false }
        setVotacionActiva(snapshot.data());
      } else {
        setVotacionActiva({});
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
    // Registramos en la DB local (memoria del navegador) que el usuario ya votó en esta categoría
    localStorage.setItem(`voto_${categoriaId}`, 'true');

    await addDoc(collection(db, "votos"), {
      categoria: categoriaId,
      candidato: candidato,
      timestamp: serverTimestamp()
    });
    // Ya no lo enviamos a resultados. Simplemente se queda aquí y el componente de Votar
    // le mostrará el cartel festivo leyendo el localStorage.
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

  // Si estamos en Modo Proyector, no mostramos absolutamente nada más que el proyector
  if (isProyector && isAdmin) {
    return (
        <Proyector 
            categorias={categoriasYcandidatos} 
            votos={votos} 
            votacionActiva={votacionActiva}
            salirProyector={() => setIsProyector(false)} 
        />
    );
  }

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>

      {/* NAVEGACIÓN */}
      <nav style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setVista('votar')} style={btnNav}>Votar</button>
        <button onClick={() => setVista('dj')} style={btnNav}>Pedir Tema</button>
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

      {vista === 'fotos' && <Galeria />}

      {/* BOTÓN SALIR ADMIN Y PROYECTOR */}
      {isAdmin && (
        <div style={{ marginTop: '50px', borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <p style={{ color: '#ffb3ff', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>Estás en Modo Administrador</p>
          <button 
            onClick={() => setIsProyector(true)} 
            style={{ ...btnNav, backgroundColor: 'transparent', borderColor: '#00ffcc', color: '#00ffcc', padding: '15px 30px', fontWeight: 'bold' }}
          >
            🖥️ Entrar a Modo Proyector
          </button>
          <button 
            onClick={() => auth.signOut()} 
            style={{ ...btnNav, backgroundColor: 'transparent', borderColor: '#777', color: '#ccc', borderStyle: 'dashed' }}
          >
            Salir del Modo Admin
          </button>
        </div>
      )}
    </div>
  );
}

// ESTILOS
const btnNav = { backgroundColor: 'transparent', color: '#e0218a', border: '1px solid #e0218a', padding: '10px', margin: '5px', cursor: 'pointer', borderRadius: '20px' };

export default App;
