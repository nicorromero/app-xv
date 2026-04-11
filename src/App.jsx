import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import GaleriaView from './views/GaleriaView';
import VotarView from './views/VotarView';
import DjView from './views/DjView';
import ProyectorView from './views/ProyectorView';
import LoginView from './views/LoginView';
import InvitadosAdminView from './views/InvitadosAdminView';

function App() {
  const [vista, setVista] = useState('votar');
  const [isProyector, setIsProyector] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();
  const isOnline = useOnlineStatus();

  // 1. GATEKEEPER: Si no está logueado, mostrar LoginView. (Bloqueo Total)
  if (!currentUser) {
    return (
        <div style={pantallaFondo}>
            <LoginView />
        </div>
    );
  }

  // 2. MODO PROYECTOR: Vista limpia gigante
  if (isProyector && isAdmin) {
    return (
        <ProyectorView salirProyector={() => setIsProyector(false)} />
    );
  }

  // 3. APLICACIÓN PRINCIPAL (Invitados + Admin)
  return (
    <div style={pantallaFondo}>

      {!isOnline && (
        <div style={offlineBanner}>
          ⚠️ Parece que no hay buena señal. Algunas opciones están limitadas, preparate para cuando vuelva!
        </div>
      )}

      {/* HEADER: Info del usuario */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <span style={{ color: '#ccc', fontSize: '14px' }}>Hola, {currentUser.displayName || currentUser.email.split('@')[0]}</span>
         <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', textDecoration: 'underline' }}>Salir</button>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setVista('votar')} style={btnNav}>Votar</button>
        <button onClick={() => setVista('dj')} style={btnNav}>Pedir Tema</button>
        <button onClick={() => setVista('fotos')} style={btnNav}>Fotos</button>
        {isAdmin && <button onClick={() => setVista('invitados')} style={{...btnNav, borderColor: '#00ffcc', color: '#00ffcc'}}>RSVPs</button>}
      </nav>

      {/* RENDERIZADO DE VISTAS */}
      {vista === 'votar' && <VotarView />}
      {vista === 'dj' && <DjView />}
      {vista === 'fotos' && <GaleriaView />}
      {vista === 'invitados' && isAdmin && <InvitadosAdminView />}

      {/* MENÚ ADMIN (Peligroso) */}
      {isAdmin && (
        <div style={{ marginTop: '50px', borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <p style={{ color: '#ffb3ff', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>Estás en Modo Administrador</p>
          <button 
            onClick={() => setIsProyector(true)} 
            style={{ ...btnNav, backgroundColor: 'transparent', borderColor: '#00ffcc', color: '#00ffcc', padding: '15px 30px', fontWeight: 'bold' }}
          >
            🖥️ Entrar a Modo Proyector
          </button>
        </div>
      )}
    </div>
  );
}

const pantallaFondo = { backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' };
const offlineBanner = { backgroundColor: 'rgba(255, 0, 0, 0.2)', color: '#ff6666', border: '1px solid #ff6666', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold' };
const btnNav = { backgroundColor: 'transparent', color: '#e0218a', border: '1px solid #e0218a', padding: '10px', margin: '5px', cursor: 'pointer', borderRadius: '20px' };

export default App;
