import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronRight, UserRound, ArrowLeft, Loader2, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBuscarMesa } from '../hooks/useBuscarMesa';

// ── Animaciones reutilizables ──────────────────────────────────────────────────
const fadeSlide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.28 },
};

// ── Componente: Tarjeta de resultado de mesa ───────────────────────────────────
const MesaCard = ({ guest, isAuto, onBack, onNavigate }) => (
  <motion.div
    {...fadeSlide}
    className="app-glass"
    style={styles.resultCard}
  >
    <div style={styles.resultHeader}>
      <div style={styles.avatar}>
        <UserRound size={28} />
      </div>
      <div>
        <span style={styles.kicker}>{isAuto ? 'Tu asignación' : 'Asignación encontrada'}</span>
        <h2 style={styles.guestName}>
          {guest.nombre}
          {guest.apellido ? ` ${guest.apellido}` : ''}
        </h2>
      </div>
    </div>

    <div style={styles.tableInfoBox}>
      <div style={styles.tableIconWrapper}>
        <MapPin size={24} color="var(--color-accent)" />
      </div>
      <div style={styles.tableDetails}>
        <span style={styles.tableLabel}>Mesa Número</span>
        <span style={styles.tableNumber}>{guest.mesa || '—'}</span>
      </div>
    </div>

    {guest.nota && (
      <div style={styles.notaBox}>
        <StickyNote size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
        <span style={styles.notaText}>{guest.nota}</span>
      </div>
    )}

    {isAuto ? (
      <button
        type="button"
        className="app-button"
        style={styles.actionBtn}
        onClick={onNavigate}
      >
        <span>Ir a la App</span>
        <ChevronRight size={18} />
      </button>
    ) : (
      <button
        type="button"
        className="app-button"
        style={styles.actionBtnSecondary}
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        <span>Volver a buscar</span>
      </button>
    )}
  </motion.div>
);

// ── Componente: Buscador manual ────────────────────────────────────────────────
const BuscadorManual = ({ searchTerm, setSearchTerm, searchResults, loadingInvitados, onSelect }) => (
  <motion.div
    key="search-box"
    {...fadeSlide}
    className="app-glass"
    style={styles.searchBox}
  >
    <div style={styles.inputWrapper}>
      <Search size={20} style={styles.searchIcon} />
      <input
        id="buscar-invitado-input"
        type="text"
        placeholder="Escribí tu nombre o apellido..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
        autoComplete="off"
        autoFocus
      />
      {searchTerm && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          style={styles.clearBtn}
          onClick={() => setSearchTerm('')}
        >
          ✕
        </button>
      )}
    </div>

    <div style={styles.resultsContainer}>
      {loadingInvitados ? (
        <div style={styles.loaderBoxSmall}>
          <Loader2 className="custom-spinner" size={20} />
          <span>Sincronizando lista...</span>
        </div>
      ) : searchTerm.trim().length >= 2 ? (
        searchResults.length > 0 ? (
          <ul style={styles.resultsList} role="listbox" aria-label="Resultados de búsqueda">
            {searchResults.map((guest) => (
              <motion.li
                key={guest.id}
                role="option"
                whileTap={{ scale: 0.97 }}
                style={styles.resultItem}
                onClick={() => onSelect(guest)}
              >
                <UserRound size={18} style={styles.itemIcon} />
                <span style={styles.itemText}>
                  {guest.nombre} {guest.apellido}
                </span>
                <ChevronRight size={16} style={styles.itemChevron} />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>No encontramos coincidencias.</span>
            <span style={styles.emptyTip}>
              💡 Probá con solo tu primer nombre, o tu apellido.
            </span>
          </div>
        )
      ) : (
        <div style={styles.emptyState}>
          <span style={styles.emptyTip}>Escribí al menos 2 letras para buscar.</span>
        </div>
      )}
    </div>
  </motion.div>
);

// ── Vista principal ────────────────────────────────────────────────────────────
const BuscarMesaView = () => {
  const navigate = useNavigate();
  const {
    authLoading,
    loadingTable,
    loadingInvitados,
    userTable,
    needsSearch,
    searchTerm,
    setSearchTerm,
    searchResults,
    selectedGuest,
    setSelectedGuest,
  } = useBuscarMesa();

  const isLoading = authLoading || loadingTable;

  const handleBack = () => {
    setSelectedGuest(null);
    setSearchTerm('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.ambientTop} />
      <div style={styles.ambientBottom} />

      <div style={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.headerBox}
        >
          <h1 style={styles.title}>¿Cuál es mi mesa?</h1>
          <p style={styles.subtitle}>
            Verificá tu asignación en el salón para disfrutar de la fiesta.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Estado: cargando ───────────────────────── */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.loaderBox}
            >
              <Loader2 className="custom-spinner" size={32} />
              <p style={styles.loaderText}>Buscando tu invitación...</p>
            </motion.div>
          )}

          {/* ── Estado: mesa encontrada automáticamente ── */}
          {!isLoading && userTable && (
            <motion.div key="auto-result" style={styles.fullWidth}>
              <MesaCard
                guest={userTable}
                isAuto
                onNavigate={() => navigate('/votar')}
              />
            </motion.div>
          )}

          {/* ── Estado: invitado seleccionado del buscador ── */}
          {!isLoading && !userTable && selectedGuest && (
            <motion.div key="manual-result" style={styles.fullWidth}>
              <MesaCard
                guest={selectedGuest}
                isAuto={false}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {/* ── Estado: buscador manual (anónimo o sin vinculación) ── */}
          {!isLoading && needsSearch && !selectedGuest && (
            <BuscadorManual
              key="search-box"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchResults={searchResults}
              loadingInvitados={loadingInvitados}
              onSelect={setSelectedGuest}
            />
          )}
        </AnimatePresence>

        {!userTable && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={styles.backLink}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Volver al inicio
          </motion.button>
        )}
      </div>
    </div>
  );
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    color: 'var(--color-text)',
    background:
      'radial-gradient(circle at 50% 0%, rgba(105, 200, 242, 0.22) 0%, rgba(6, 26, 47, 0) 38%), linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg) 48%, #071f35 100%)',
    fontFamily: "'Montserrat', sans-serif",
    overflowX: 'hidden',
  },
  ambientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  content: {
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '4vh',
  },
  fullWidth: { width: '100%' },
  headerBox: { textAlign: 'center', marginBottom: '8px' },
  title: {
    fontSize: '28px',
    fontWeight: 900,
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #fff 0%, #a5d8ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { fontSize: '14px', color: 'var(--color-text-soft)', lineHeight: 1.5 },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '16px',
    color: 'var(--color-accent)',
  },
  loaderText: { color: 'var(--color-text-soft)', fontSize: '14px', fontWeight: 600 },
  loaderBoxSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '24px',
    color: 'var(--color-text-soft)',
    fontSize: '13px',
    fontWeight: 600,
  },
  resultCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid rgba(105, 200, 242, 0.25)',
    background: 'rgba(6, 26, 47, 0.6)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  resultHeader: { display: 'flex', alignItems: 'center', gap: '16px' },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(105, 200, 242, 0.2) 0%, rgba(105, 200, 242, 0.05) 100%)',
    border: '1px solid rgba(105, 200, 242, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-accent)',
    flexShrink: 0,
  },
  kicker: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--color-accent)',
    marginBottom: '4px',
  },
  guestName: { fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 },
  tableInfoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(105, 200, 242, 0.1)',
    border: '1px solid rgba(105, 200, 242, 0.15)',
  },
  tableIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tableDetails: { display: 'flex', flexDirection: 'column' },
  tableLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-soft)',
    marginBottom: '2px',
  },
  tableNumber: { fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1 },
  notaBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  notaText: { fontSize: '13px', color: 'var(--color-text-soft)', lineHeight: 1.5 },
  actionBtn: {
    width: '100%',
    minHeight: '52px',
    borderRadius: 'var(--radius-pill)',
    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
    color: '#052033',
    fontWeight: 800,
    fontSize: '15px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(45, 159, 224, 0.3)',
  },
  actionBtnSecondary: {
    width: '100%',
    minHeight: '52px',
    borderRadius: 'var(--radius-pill)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--color-text)',
    fontWeight: 700,
    fontSize: '15px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  searchBox: {
    borderRadius: 'var(--radius-xl)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  inputWrapper: { position: 'relative', width: '100%' },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-soft)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    minHeight: '56px',
    padding: '0 44px 0 48px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'var(--color-text)',
    fontSize: '16px',
    fontWeight: 500,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-soft)',
    fontSize: '16px',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '4px',
  },
  resultsContainer: {
    minHeight: '80px',
    maxHeight: '300px',
    overflowY: 'auto',
    borderRadius: 'var(--radius-md)',
  },
  resultsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    border: '1px solid transparent',
  },
  itemIcon: { color: 'var(--color-accent)', flexShrink: 0 },
  itemText: { flex: 1, fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' },
  itemChevron: { color: 'var(--color-text-muted)', flexShrink: 0 },
  emptyState: {
    padding: '24px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  emptyText: { fontSize: '14px', fontWeight: 600, color: 'var(--color-text-soft)' },
  emptyTip: { fontSize: '13px', color: 'var(--color-accent)' },
  backLink: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '12px',
    marginTop: 'auto',
  },
};

export default BuscarMesaView;
