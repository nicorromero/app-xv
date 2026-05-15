import { createElement, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, LogOut, MonitorPlay, Music2, Settings, Star, UserRound, Users, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate';
import SafariEnforcer from '../components/layout/SafariEnforcer';

const GaleriaView = lazy(() => import('../features/gallery/views/GaleriaView'));
const VotarView = lazy(() => import('../features/voting/views/VotarView'));
const DjView = lazy(() => import('../features/dj/views/DjView'));
const ProyectorView = lazy(() => import('../features/voting/views/ProyectorView'));
const LoginView = lazy(() => import('../features/auth/views/LoginView'));
const InvitadosAdminView = lazy(() => import('../features/admin/views/InvitadosAdminView'));
const VotingAdminView = lazy(() => import('../features/admin/views/VotingAdminView'));

const MotionDiv = motion.div;
const MotionButton = motion.button;

const navItems = [
  { path: '/votar', label: 'Votar', icon: Star },
  { path: '/dj', label: 'DJ', icon: Music2 },
  { path: '/fotos', label: 'Fotos', icon: Camera },
];

const ViewLoader = () => (
  <div style={styles.viewLoader}>
    <div className="custom-spinner" />
    <div style={styles.loaderText}>Cargando...</div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <ViewLoader />;
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return <ViewLoader />;
  if (!currentUser || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppLayout = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const isOnline = useOnlineStatus();
  useServiceWorkerUpdate({ autoReload: true, reloadDelay: 1500 });
  const navigate = useNavigate();
  const location = useLocation();
  const [isProyector, setIsProyector] = useState(false);

  if (isProyector && isAdmin) {
    return (
      <ProyectorView salirProyector={() => setIsProyector(false)} />
    );
  }

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Invitado';

  return (
    <>
      <SafariEnforcer />

      <div style={styles.appShell}>
        <div style={styles.ambientTop} />
        <div style={styles.ambientBottom} />

        <div style={styles.shellInner}>
          <AnimatePresence>
            {!isOnline && (
              <MotionDiv
                className="app-glass"
                style={styles.offlineBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <WifiOff size={18} />
                <span>Parece que no hay buena señal. Algunas opciones están limitadas.</span>
              </MotionDiv>
            )}
          </AnimatePresence>

          <header className="app-glass" style={styles.userHeader}>
            <div style={styles.userAvatar}>
              <UserRound size={18} />
            </div>
            <div style={styles.userCopy}>
              <span style={styles.kicker}>Bienvenido</span>
              <strong style={styles.userName}>Hola, {displayName}</strong>
            </div>
            <MotionButton
              type="button"
              className="app-button"
              onClick={logout}
              style={styles.logoutBtn}
              whileTap={{ scale: 0.96 }}
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </MotionButton>
          </header>

          <main style={styles.mainContent}>
            <Suspense fallback={<ViewLoader />}>
              <Outlet />
            </Suspense>

            {isAdmin && (
              <section className="app-glass" style={styles.adminPanel}>
                <div style={styles.adminPanelHeader}>
                  <Settings size={18} />
                  <span>Modo administrador</span>
                </div>
                <MotionButton
                  type="button"
                  className="app-button"
                  onClick={() => setIsProyector(true)}
                  style={styles.projectorBtn}
                  whileTap={{ scale: 0.97 }}
                >
                  <MonitorPlay size={18} />
                  Modo proyector
                </MotionButton>
                <div style={styles.adminLinks}>
                  <MotionButton
                    type="button"
                    className="app-button"
                    onClick={() => navigate('/admin/invitados')}
                    style={styles.adminLinkBtn}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Users size={16} />
                    Invitados
                  </MotionButton>
                  <MotionButton
                    type="button"
                    className="app-button"
                    onClick={() => navigate('/admin/votaciones')}
                    style={styles.adminLinkBtn}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Star size={16} />
                    CMS votaciones
                  </MotionButton>
                </div>
              </section>
            )}
          </main>
        </div>

        <nav className="app-glass" style={styles.bottomNav} aria-label="Navegación principal">
          {navItems.map(({ path, label, icon }) => {
            const isActive = location.pathname === path;
            return (
              <MotionButton
                key={path}
                type="button"
                className="app-button"
                onClick={() => navigate(path)}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : null),
                }}
                whileTap={{ scale: 0.94 }}
                aria-current={isActive ? 'page' : undefined}
              >
                {createElement(icon, { size: 20, strokeWidth: isActive ? 2.4 : 1.9 })}
                <span>{label}</span>
              </MotionButton>
            );
          })}
        </nav>
      </div>
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<ViewLoader />}>
          <LoginView />
        </Suspense>
      } />

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

const styles = {
  appShell: {
    color: 'var(--color-text)',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflowX: 'hidden',
    background: 'radial-gradient(circle at 50% 0%, rgba(105, 200, 242, 0.22) 0%, rgba(6, 26, 47, 0) 38%), linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg) 48%, #071f35 100%)',
    fontFamily: "'Montserrat', sans-serif",
  },
  ambientTop: {
    position: 'fixed',
    inset: '0 0 auto 0',
    height: '260px',
    background: 'linear-gradient(135deg, rgba(105, 200, 242, 0.16), rgba(255, 255, 255, 0))',
    pointerEvents: 'none',
  },
  ambientBottom: {
    position: 'fixed',
    right: '-120px',
    bottom: '40px',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'rgba(45, 159, 224, 0.16)',
    filter: 'blur(64px)',
    pointerEvents: 'none',
  },
  shellInner: {
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
    padding: '16px 16px 112px',
    position: 'relative',
    zIndex: 2,
  },
  viewLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '220px',
    flexDirection: 'column',
    gap: '15px',
  },
  loaderText: {
    color: 'var(--color-text-soft)',
    fontSize: '14px',
  },
  offlineBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    marginBottom: '12px',
    color: 'var(--color-error-text)',
    borderColor: 'var(--color-error-border)',
    background: 'var(--color-error-bg)',
    fontWeight: 700,
    fontSize: '13px',
    lineHeight: 1.35,
  },
  userHeader: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    gap: '12px',
    borderRadius: 'var(--radius-lg)',
    padding: '12px',
    marginBottom: '18px',
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'rgba(105, 200, 242, 0.14)',
    border: '1px solid rgba(105, 200, 242, 0.24)',
    color: 'var(--color-accent)',
  },
  userCopy: {
    minWidth: 0,
    textAlign: 'left',
  },
  kicker: {
    display: 'block',
    color: 'var(--color-text-soft)',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '3px',
  },
  userName: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '15px',
    color: 'var(--color-text)',
  },
  logoutBtn: {
    width: '44px',
    minHeight: '44px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    border: '1px solid rgba(248, 113, 113, 0.25)',
    background: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--color-error-text)',
    cursor: 'pointer',
  },
  mainContent: {
    minHeight: 'calc(100vh - 190px)',
  },
  bottomNav: {
    position: 'fixed',
    left: '50%',
    bottom: 'max(14px, env(safe-area-inset-bottom))',
    transform: 'translateX(-50%)',
    zIndex: 20,
    width: 'min(calc(100% - 28px), 460px)',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
    borderRadius: 'var(--radius-lg)',
    padding: '7px',
  },
  navButton: {
    minHeight: '58px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    border: '1px solid transparent',
    borderRadius: '22px',
    background: 'transparent',
    color: 'var(--color-text-soft)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 800,
  },
  navButtonActive: {
    color: '#052033',
    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
    borderColor: 'rgba(255, 255, 255, 0.26)',
    boxShadow: '0 12px 28px rgba(45, 159, 224, 0.22)',
  },
  adminPanel: {
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    marginTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  adminPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: 'var(--color-accent)',
    fontWeight: 900,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  projectorBtn: {
    minHeight: '48px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid rgba(105, 200, 242, 0.28)',
    background: 'rgba(105, 200, 242, 0.12)',
    color: 'var(--color-text)',
    fontWeight: 800,
    cursor: 'pointer',
  },
  adminLinks: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  adminLinkBtn: {
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid rgba(186, 230, 255, 0.18)',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },
};

export default App;
