import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate';
import SafariEnforcer from '../components/layout/SafariEnforcer';

// Lazy loading de vistas para reducir bundle inicial
const GaleriaView = lazy(() => import('../features/gallery/views/GaleriaView'));
const VotarView = lazy(() => import('../features/voting/views/VotarView'));
const DjView = lazy(() => import('../features/dj/views/DjView'));
const ProyectorView = lazy(() => import('../features/voting/views/ProyectorView'));
const LoginView = lazy(() => import('../features/auth/views/LoginView'));
const InvitadosAdminView = lazy(() => import('../features/admin/views/InvitadosAdminView'));
const VotingAdminView = lazy(() => import('../features/admin/views/VotingAdminView'));

// Componente de carga ligero (Spinner)
const ViewLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        flexDirection: 'column',
        gap: '15px'
    }}>
        <div className="custom-spinner"></div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Cargando...</div>
    </div>
);

// Bloquea el acceso si el usuario no está logueado
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <ViewLoader />;
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

// Bloquea el acceso si no es admin
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return <ViewLoader />;
  if (!currentUser || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Layout principal de la app (invitados logueados + admin)
const AppLayout = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const isOnline = useOnlineStatus();
  const { hasUpdate } = useServiceWorkerUpdate({ autoReload: true, reloadDelay: 1500 });
  const navigate = useNavigate();
  const location = useLocation();
  const [isProyector, setIsProyector] = useState(false);

  // MODO PROYECTOR: Vista limpia gigante
  if (isProyector && isAdmin) {
    return (
      <ProyectorView salirProyector={() => setIsProyector(false)} />
    );
  }

  return (
    <>
      <SafariEnforcer />
      
      <div style={pantallaFondo}>

      {!isOnline && (
        <div style={offlineBanner}>
          ⚠️ Parece que no hay buena señal. Algunas opciones están limitadas, preparate para cuando vuelva!
        </div>
      )}

      {/* HEADER: Info del usuario */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#ccc', fontSize: '14px' }}>Hola, {currentUser?.displayName || currentUser?.email?.split('@')[0]}</span>
        <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', textDecoration: 'underline' }}>Salir</button>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/votar')} style={{ ...btnNav, backgroundColor: location.pathname === '/votar' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>Votar</button>
        <button onClick={() => navigate('/dj')} style={{ ...btnNav, backgroundColor: location.pathname === '/dj' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>Pedir Tema</button>
        <button onClick={() => navigate('/fotos')} style={{ ...btnNav, backgroundColor: location.pathname === '/fotos' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>Fotos</button>
      </nav>

      {/* RENDERIZADO DE VISTAS con lazy loading */}
      <Suspense fallback={<ViewLoader />}>
        <Outlet />
      </Suspense>

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
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/admin/invitados')} style={{...btnNav, backgroundColor: 'rgba(255,100,100,0.2)', borderWidth: '1px', borderColor: 'rgba(255,100,100,0.5)'}}>
                  Invitados
              </button>
              <button onClick={() => navigate('/admin/votaciones')} style={{...btnNav, backgroundColor: 'rgba(255,100,100,0.2)', borderWidth: '1px', borderColor: 'rgba(255,100,100,0.5)'}}>
                  CMS Votaciones
              </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

function App() {
  return (
    <Routes>
      {/* RUTA PÚBLICA / PORTADA: No requiere sesión y carga de inmediato */}
      <Route path="/" element={
        <Suspense fallback={<ViewLoader />}>
          <LoginView />
        </Suspense>
      } />
      
      {/* RUTAS PROTEGIDAS: Requieren sesión iniciada */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/votar" element={<VotarView />} />
        <Route path="/dj" element={<DjView />} />
        <Route path="/fotos" element={<GaleriaView />} />
        <Route path="/admin/invitados" element={<AdminRoute><InvitadosAdminView /></AdminRoute>} />
        <Route path="/admin/votaciones" element={<AdminRoute><VotingAdminView /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const pantallaFondo = {
  backgroundColor: '#0d1b2a',
  color: 'white',
  minHeight: '100vh',
  width: '100%',
  padding: '16px',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  overflowX: 'hidden',
  background: 'linear-gradient(-45deg, #0d1b2a, #1b3a5f, #0d1b2a, #2E5C8A)',
  backgroundSize: '400% 400%',
  animation: 'gradientBG 15s ease infinite'
};

// Inyectar animación del fondo si aún no existe
if (typeof document !== 'undefined' && !document.getElementById('app-bg-anim')) {
  const s = document.createElement('style');
  s.id = 'app-bg-anim';
  s.innerText = `
    @keyframes gradientBG { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    .custom-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: #ffb3ff;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
  `;
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

const updateBanner = {
  backgroundColor: 'rgba(0, 200, 100, 0.2)',
  color: '#00cc66',
  border: '1px solid #00cc66',
  padding: '10px 14px',
  borderRadius: '10px',
  marginBottom: '20px',
  fontWeight: 'bold',
  fontSize: '14px',
  textAlign: 'center'
};

const btnNav = {
  backgroundColor: 'transparent',
  color: '#2E5C8A',
  border: '1px solid #2E5C8A' ,
  padding: '10px 16px',
  margin: '4px',
  cursor: 'pointer',
  borderRadius: '20px',
  fontSize: '14px',
  whiteSpace: 'nowrap'
};

export default App;
