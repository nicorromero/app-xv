import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { auth } from './services/firebaseConfig';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import GaleriaView from './views/GaleriaView';
import VotarView from './views/VotarView';
import DjView from './views/DjView';
import ProyectorView from './views/ProyectorView';

function App() {
  const [vista, setVista] = useState('votar');
  const [isProyector, setIsProyector] = useState(false);
  const { isAdmin } = useAuth();
  const isOnline = useOnlineStatus();

  // Si estamos en Modo Proyector, no mostramos absolutamente nada más que el proyector
  if (isProyector && isAdmin) {
    return (
        <ProyectorView salirProyector={() => setIsProyector(false)} />
    );
  }

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>

      {/* BANNER DE OFFLINE */}
      {!isOnline && (
        <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.2)', color: '#ff6666', border: '1px solid #ff6666', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold' }}>
          ⚠️ Parece que no hay buena señal. Algunas opciones están limitadas, preparate para cuando vuelva!
        </div>
      )}

      {/* NAVEGACIÓN */}
      <nav style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setVista('votar')} style={btnNav}>Votar</button>
        <button onClick={() => setVista('dj')} style={btnNav}>Pedir Tema</button>
        <button onClick={() => setVista('fotos')} style={btnNav}>Fotos</button>
      </nav>

      {/* RENDERIZADO DE VISTAS */}
      {vista === 'votar' && <VotarView />}
      {vista === 'dj' && <DjView />}
      {vista === 'fotos' && <GaleriaView />}

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
