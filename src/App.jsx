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
  const isChromeIOS = /CriOS/i.test(navigator.userAgent);
  if (isChromeIOS) {
    window.location.href = 'x-web-search://' + window.location.href;
  }

  // 1. GATEKEEPER: Si no está logueado, mostrar LoginView. (Bloqueo Total)
  if (!currentUser) {
    return <LoginView />;
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
        {isAdmin && <button onClick={() => setVista('invitados')} style={{ ...btnNav, borderColor: '#00ffcc', color: '#00ffcc' }}>RSVPs</button>}
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

const pantallaFondo = {
  backgroundColor: '#0f0f0f',
  color: 'white',
  minHeight: '100vh',
  width: '100%',
  padding: '16px',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  overflowX: 'hidden',
  background: 'linear-gradient(-45deg, #1a0a1a, #3d0030, #1a0a1a, #5c0050)',
  backgroundSize: '400% 400%',
  animation: 'gradientBG 15s ease infinite'
};

// Inyectar animación del fondo si aún no existe
if (typeof document !== 'undefined' && !document.getElementById('app-bg-anim')) {
  const s = document.createElement('style');
  s.id = 'app-bg-anim';
  s.innerText = `@keyframes gradientBG { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }`;
  document.head.appendChild(s);
}

const offlineBanner = {
  backgroundColor: 'rgba(255, 0, 0, 0.2)',
  color: '#ff6666',
  border: '1px solid #ff6666',
  padding: '10px 14px',
  borderRadius: '10px',
  marginBottom: '20px',
  fontWeight: 'bold',
  fontSize: '14px',
  textAlign: 'left'
};

const btnNav = {
  backgroundColor: 'transparent',
  color: '#e0218a',
  border: '1px solid #e0218a',
  padding: '10px 16px',
  margin: '4px',
  cursor: 'pointer',
  borderRadius: '20px',
  fontSize: '14px',
  whiteSpace: 'nowrap'
};

export default App;
