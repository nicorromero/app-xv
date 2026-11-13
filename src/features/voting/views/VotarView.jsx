import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, CloudOff, Eye, Flame, Hourglass, Lock, Play, Star } from 'lucide-react';
import AdminTrigger from '../../../features/admin/components/AdminTrigger';
import { useAuth } from '../../../context/AuthContext';
import { useVotaciones } from '../hooks/useVotaciones';
import { useResultadosVotos } from '../hooks/useResultadosVotos';
import { useCategorias } from '../hooks/useCategorias';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { getOptimizedUrl } from '../../../utils/cloudinaryUtils';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const listVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.32, ease: 'easeOut' },
    },
};

function VotarView() {
    const { isAdmin } = useAuth();
    const isOnline = useOnlineStatus();
    const { categorias, loading } = useCategorias('client');
    const { 
        votacionActiva, 
        previewCategoria, 
        abrirCategoria, 
        cerrarCategoria, 
        toggleCategoria 
    } = useVotaciones();
    const { emitirVoto, pendingSync, syncPendingVotes } = useResultadosVotos();

    const [catSeleccionada, setCatSeleccionada] = useState(null);
    const [votoTemporal, setVotoTemporal] = useState(null);
    const [votacionError, setVotacionError] = useState(null); // null | 'duplicate' | 'generic'

    // Detectar si hay una categoría en curso (abierta o en preview)
    const catEnCurso = categorias.find(
        cat => votacionActiva[cat.id] === true || votacionActiva[cat.id] === 'preview'
    );
    const isForcedClient = !isAdmin && !!catEnCurso;
    const categoriaARenderizar = isForcedClient ? catEnCurso : catSeleccionada;

    const estadoCatARenderizar = categoriaARenderizar ? votacionActiva[categoriaARenderizar.id] : null;
    const isCategoriaEnPreview = estadoCatARenderizar === 'preview';
    const isCategoriaAbierta = estadoCatARenderizar === true;

    const handleVoto = async (categoria, candidato) => {
        // Si está en preview, no permitir votar
        if (isCategoriaEnPreview) return;

        // 1. Congelar UI inmediatamente (optimistic) — independiente de la red
        setVotoTemporal(categoria.id);
        setVotacionError(null);

        // _version identifica unívocamente la ronda activa para esta categoría
        const version = votacionActiva[`${categoria.id}_version`] ?? 0;
        const resultado = await emitirVoto(categoria.id, candidato, isOnline, version);

        // 2. Si el servidor rechazó con permission-denied: doble tap accidental
        if (resultado?.error?.code === 'permission-denied') {
            setVotoTemporal(null);
            setVotacionError('duplicate');
            return;
        }

        if (isAdmin) {
            setCatSeleccionada(null);
        }
        // Para invitados: el estado optimista ya está seteado
    };

    useEffect(() => {
        if (isOnline && pendingSync > 0) {
            const timer = setTimeout(() => {
                // Pasar votacionActiva para que syncPendingVotes descarte votos de rondas anteriores
                syncPendingVotes(votacionActiva);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOnline, pendingSync, syncPendingVotes, votacionActiva]);

    // Cuando el admin abre una nueva ronda (nueva _version), purgar proactivamente
    // los votos offline stale de esa categoría ANTES de que syncPendingVotes corra.
    useEffect(() => {
        if (pendingSync === 0) return;
        try {
            const queue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
            const queueActualizada = queue.filter(op => {
                if (op.type !== 'voto') return true;
                const { categoriaId, version } = op.data;
                const versionActual = votacionActiva[`${categoriaId}_version`];
                // Conservar si no hay version guardada (votos viejos sin version) o si la versión coincide
                return !version || !versionActual || String(version) === String(versionActual);
            });
            if (queueActualizada.length !== queue.length) {
                localStorage.setItem('offline_sync_queue', JSON.stringify(queueActualizada));
                setPendingSync(queueActualizada.filter(op => op.type === 'voto').length);
            }
        } catch (e) {
            // No crítico: syncPendingVotes también filtra por versión
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [votacionActiva]);

    // Limpiar error y voto temporal cuando cambia la categoría activa
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setVotoTemporal(null); setVotacionError(null); }, [categoriaARenderizar?.id, votacionActiva]);

    if (loading) {
        return (
            <div style={styles.container}>
                <div className="app-glass" style={styles.loadingCard}>
                    <div className="custom-spinner" />
                    <p style={styles.loadingText}>Cargando categorías...</p>
                </div>
            </div>
        );
    }

    if (categoriaARenderizar) {
        const keyVersion = `voto_${categoriaARenderizar.id}_version`;
        const localVersion = localStorage.getItem(keyVersion);
        const fbVersion = votacionActiva[`${categoriaARenderizar.id}_version`];

        if (fbVersion && localVersion !== String(fbVersion)) {
            localStorage.removeItem(`voto_${categoriaARenderizar.id}`);
            localStorage.setItem(keyVersion, fbVersion);
        }

        const yaVoto = localStorage.getItem(`voto_${categoriaARenderizar.id}`) === 'true' || votoTemporal === categoriaARenderizar.id;

        if (yaVoto && !isAdmin) {
            const isPending = !isOnline || pendingSync > 0;
            const StatusIcon = isPending ? Hourglass : CheckCircle2;

            return (
                <div style={styles.container}>
                    <MotionDiv
                        className="app-glass"
                        style={styles.votoConfirmadoCard}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div style={isPending ? styles.statusIconPending : styles.statusIconSuccess}>
                            <StatusIcon size={34} strokeWidth={2.2} />
                        </div>
                        <h3 style={styles.votoConfirmadoTitle}>
                            {isPending ? 'Voto guardado' : 'Voto registrado'}
                        </h3>
                        <p style={styles.votoConfirmadoText}>
                            {isPending
                                ? 'Tu voto se enviará automáticamente cuando recuperes señal.'
                                : 'Prestá atención a la pantalla gigante para ver los resultados en vivo.'}
                        </p>
                        {isPending && (
                            <div style={styles.pendingBadge}>
                                <CloudOff size={15} /> Pendiente de sincronizar
                            </div>
                        )}
                    </MotionDiv>
                </div>
            );
        }

        // Error de doble voto detectado por Firestore (permission-denied)
        if (votacionError === 'duplicate' && !isAdmin) {
            return (
                <div style={styles.container}>
                    <MotionDiv
                        className="app-glass"
                        style={styles.votoConfirmadoCard}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div style={styles.statusIconSuccess}>
                            <CheckCircle2 size={34} strokeWidth={2.2} />
                        </div>
                        <h3 style={styles.votoConfirmadoTitle}>Ya dejaste tu voto</h3>
                        <p style={styles.votoConfirmadoText}>
                            Tu voto en esta categoría ya fue registrado anteriormente.
                        </p>
                    </MotionDiv>
                </div>
            );
        }

        return (
            <div style={styles.container}>
                <HeaderBlock
                    title={categoriaARenderizar.titulo}
                    subtitle={
                        isCategoriaEnPreview
                            ? "Presentación de nominados"
                            : "Elegí a tu favorito"
                    }
                    variant="vote"
                />

                {/* Banner informativo cuando la categoría está en preview (antes de abrir) */}
                {isCategoriaEnPreview && (
                    <motion.div
                        className="app-glass"
                        style={styles.previewAlertBanner}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div style={styles.previewAlertIcon}>
                            <Eye size={22} />
                        </div>
                        <div style={styles.previewAlertContent}>
                            <strong style={styles.previewAlertTitle}>Nominados en pantalla</strong>
                            <p style={styles.previewAlertText}>
                                La votación comenzará en cualquier momento... ¡Mirá el proyector y preparate!
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Barra rápida de administración si el admin está viendo los nominados */}
                {isAdmin && (
                    <div style={styles.adminActionToolbar}>
                        {isCategoriaEnPreview && (
                            <MotionButton
                                type="button"
                                onClick={() => abrirCategoria(categoriaARenderizar.id)}
                                style={styles.adminOpenLiveBtn}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Flame size={18} />
                                ¡Abrir Votación Ahora!
                            </MotionButton>
                        )}
                        {isCategoriaAbierta && (
                            <MotionButton
                                type="button"
                                onClick={() => cerrarCategoria(categoriaARenderizar.id)}
                                style={styles.adminCloseLiveBtn}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Lock size={16} />
                                Cerrar Votación
                            </MotionButton>
                        )}
                        {!isCategoriaEnPreview && !isCategoriaAbierta && (
                            <MotionButton
                                type="button"
                                onClick={() => previewCategoria(categoriaARenderizar.id)}
                                style={styles.adminPreviewBtn}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Eye size={16} />
                                Proyectar Preview
                            </MotionButton>
                        )}
                    </div>
                )}

                <MotionDiv
                    style={styles.opcionesContainer}
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {(categoriaARenderizar.candidatos || []).map(c => (
                        <MotionButton
                            key={c.nombre}
                            type="button"
                            onClick={() => handleVoto(categoriaARenderizar, c.nombre)}
                            className="app-button"
                            disabled={isCategoriaEnPreview}
                            style={{
                                ...styles.candidatoBtn,
                                ...(isCategoriaEnPreview ? styles.candidatoBtnDisabled : {}),
                            }}
                            aria-label={
                                isCategoriaEnPreview 
                                    ? `Nominado: ${c.nombre} (Votación en pausa)` 
                                    : `Votar por ${c.nombre}`
                            }
                            whileTap={!isCategoriaEnPreview ? { scale: 0.98 } : undefined}
                            whileHover={!isCategoriaEnPreview ? { y: -1 } : undefined}
                        >
                            <span style={styles.candidatoInfo}>
                                {c.photoUrl ? (
                                    <img src={getOptimizedUrl(c.photoUrl)} alt={c.nombre} style={styles.candidatoPhoto} />
                                ) : (
                                    <span style={styles.candidatoFallback}>
                                        {c.nombre?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                )}
                                <span style={styles.candidatoName}>{c.nombre}</span>
                            </span>
                            {isCategoriaEnPreview ? (
                                <span style={styles.badgeEsperandoVoto}>
                                    <Hourglass size={15} /> En espera
                                </span>
                            ) : (
                                <CheckCircle2 size={20} style={styles.voteIcon} />
                            )}
                        </MotionButton>
                    ))}
                </MotionDiv>

                {!isForcedClient && (
                    <MotionButton
                        type="button"
                        onClick={() => setCatSeleccionada(null)}
                        className="app-button"
                        style={styles.backBtn}
                        aria-label="Volver a la lista de categorías"
                        whileTap={{ scale: 0.97 }}
                    >
                        <ArrowLeft size={17} />
                        Volver a categorías
                    </MotionButton>
                )}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <AdminTrigger>
                <HeaderBlock
                    title="Premios de la Noche"
                    subtitle="Andá pensando en tu favorito"
                    variant="list"
                />
            </AdminTrigger>

            <MotionDiv
                style={styles.categoriasContainer}
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence initial={false}>
                    {categorias.map(cat => {
                        const estadoCat = votacionActiva[cat.id];
                        const isCatOpen = estadoCat === true;
                        const isCatPreview = estadoCat === 'preview';
                        const isCatInteractable = isCatOpen || isCatPreview || isAdmin;

                        let estadoMeta = 'Aún no disponible';
                        if (isCatOpen) estadoMeta = '🔥 Votación abierta';
                        else if (isCatPreview) estadoMeta = '👀 Presentando nominados';

                        return (
                            <MotionDiv
                                key={cat.id}
                                style={styles.categoriaRow}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MotionButton
                                    type="button"
                                    onClick={() => { if (isCatInteractable) setCatSeleccionada(cat); }}
                                    aria-label={
                                        isCatOpen
                                            ? `Ver candidatos para ${cat.titulo}`
                                            : isCatPreview
                                            ? `Ver nominados de ${cat.titulo}`
                                            : `Categoría ${cat.titulo} cerrada`
                                    }
                                    disabled={!isCatInteractable}
                                    className="app-button"
                                    style={{
                                        ...styles.categoriaBtn,
                                        ...(isCatOpen ? styles.categoriaBtnActive : {}),
                                        ...(isCatPreview ? styles.categoriaBtnPreview : {}),
                                        ...(!isCatOpen && !isCatPreview ? styles.categoriaBtnClosed : {}),
                                    }}
                                    whileTap={isCatInteractable ? { scale: 0.98 } : undefined}
                                    whileHover={isCatInteractable ? { y: -1 } : undefined}
                                >
                                    <span style={
                                        isCatOpen 
                                            ? styles.categoryStatusActive 
                                            : isCatPreview 
                                            ? styles.categoryStatusPreview 
                                            : styles.categoryStatusClosed
                                    }>
                                        {isCatOpen ? <Flame size={16} /> : isCatPreview ? <Eye size={16} /> : <Lock size={15} />}
                                    </span>
                                    <span style={styles.categoryText}>
                                        <span style={styles.categoryTitle}>{cat.titulo}</span>
                                        <span style={styles.categoryMeta}>
                                            {estadoMeta}
                                        </span>
                                    </span>
                                    {isCatInteractable && <ChevronRight size={19} style={styles.chevronIcon} />}
                                </MotionButton>

                                {isAdmin && (
                                    <div style={styles.adminCategoryActions}>
                                        {isCatPreview ? (
                                            <>
                                                <MotionButton
                                                    type="button"
                                                    onClick={() => abrirCategoria(cat.id)}
                                                    className="app-button"
                                                    style={styles.adminActionBtnOpenLive}
                                                    title="Abrir votación formalmente"
                                                    whileTap={{ scale: 0.94 }}
                                                >
                                                    <Flame size={14} /> Abrir
                                                </MotionButton>
                                                <MotionButton
                                                    type="button"
                                                    onClick={() => cerrarCategoria(cat.id)}
                                                    className="app-button"
                                                    style={styles.adminActionBtnClose}
                                                    title="Cerrar y cancelar preview"
                                                    whileTap={{ scale: 0.94 }}
                                                >
                                                    <Lock size={14} />
                                                </MotionButton>
                                            </>
                                        ) : isCatOpen ? (
                                            <MotionButton
                                                type="button"
                                                onClick={() => cerrarCategoria(cat.id)}
                                                className="app-button"
                                                style={styles.adminActionBtnCloseWide}
                                                whileTap={{ scale: 0.94 }}
                                            >
                                                Cerrar
                                            </MotionButton>
                                        ) : (
                                            <>
                                                <MotionButton
                                                    type="button"
                                                    onClick={() => previewCategoria(cat.id)}
                                                    className="app-button"
                                                    style={styles.adminActionBtnPreview}
                                                    title="Previsualizar en proyector y celulares antes de votar"
                                                    whileTap={{ scale: 0.94 }}
                                                >
                                                    <Eye size={14} /> Preview
                                                </MotionButton>
                                                <MotionButton
                                                    type="button"
                                                    onClick={() => abrirCategoria(cat.id)}
                                                    className="app-button"
                                                    style={styles.adminActionBtnOpenDirect}
                                                    title="Abrir directamente sin preview"
                                                    whileTap={{ scale: 0.94 }}
                                                >
                                                    <Play size={14} />
                                                </MotionButton>
                                            </>
                                        )}
                                    </div>
                                )}
                            </MotionDiv>
                        );
                    })}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
}

const HeaderBlock = ({ title, subtitle, variant }) => (
    <header className="app-glass" style={styles.header}>
        <div style={styles.headerInner}>
            <div style={variant === 'vote' ? styles.iconBadgeActive : styles.iconBadge}>
                <Star size={24} strokeWidth={1.8} />
            </div>
            <span style={styles.headerKicker}>Votaciones</span>
            <h2 style={styles.title}>{title}</h2>
            <p style={styles.subtitle}>{subtitle}</p>
        </div>
    </header>
);

const styles = {
    container: {
        fontFamily: "'Montserrat', sans-serif",
        color: 'var(--color-text)',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '4px 0 18px',
    },
    loadingCard: {
        minHeight: '220px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '14px',
    },
    loadingText: {
        color: 'var(--color-text-muted)',
        fontSize: '14px',
        margin: 0,
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        margin: '6px auto 18px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 16px 20px',
    },
    headerInner: {
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconBadge: {
        width: '56px',
        height: '56px',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 12px',
        borderRadius: '50%',
        color: 'var(--color-accent)',
        background: 'rgba(105, 200, 242, 0.12)',
        border: '1px solid rgba(105, 200, 242, 0.24)',
    },
    iconBadgeActive: {
        width: '56px',
        height: '56px',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 12px',
        borderRadius: '50%',
        color: '#052033',
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
        boxShadow: 'var(--shadow-glow)',
    },
    headerKicker: {
        display: 'block',
        color: 'var(--color-accent)',
        fontSize: '12px',
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '8px',
    },
    title: {
        width: '100%',
        fontSize: 'clamp(22px, 7vw, 28px)',
        lineHeight: 1.12,
        fontWeight: 900,
        margin: '0 0 8px',
        color: 'var(--color-text)',
        textWrap: 'balance',
        overflowWrap: 'anywhere',
    },
    subtitle: {
        width: '100%',
        fontSize: '14px',
        lineHeight: 1.45,
        color: 'var(--color-text-muted)',
        margin: 0,
        textWrap: 'balance',
    },
    categoriasContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    categoriaRow: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '10px',
        alignItems: 'stretch',
    },
    categoriaBtn: {
        minHeight: '74px',
        display: 'grid',
        gridTemplateColumns: '38px 1fr auto',
        alignItems: 'center',
        gap: '12px',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--color-text)',
        padding: '12px 14px',
        fontSize: '15px',
        fontWeight: 800,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: 'var(--shadow-soft)',
    },
    categoriaBtnActive: {
        border: '1px solid rgba(105, 200, 242, 0.34)',
        background: 'rgba(8, 40, 64, 0.95)',
    },
    categoriaBtnPreview: {
        border: '1px solid rgba(126, 200, 227, 0.5)',
        background: 'rgba(10, 48, 78, 0.95)',
        boxShadow: '0 0 20px rgba(126, 200, 227, 0.2)',
    },
    categoriaBtnClosed: {
        opacity: 0.72,
        cursor: 'not-allowed',
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(186, 230, 255, 0.12)',
    },
    categoryStatusActive: {
        width: '38px',
        height: '38px',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        color: '#052033',
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
    },
    categoryStatusPreview: {
        width: '38px',
        height: '38px',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        color: '#052033',
        background: 'linear-gradient(135deg, #7EC8E3 0%, #38bdf8 100%)',
    },
    categoryStatusClosed: {
        width: '38px',
        height: '38px',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        color: 'var(--color-text-soft)',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(186, 230, 255, 0.12)',
    },
    categoryText: {
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    categoryTitle: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    categoryMeta: {
        color: 'var(--color-text-soft)',
        fontSize: '12px',
        fontWeight: 700,
    },
    chevronIcon: {
        color: 'var(--color-accent)',
    },
    adminCategoryActions: {
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
    },
    adminActionBtnPreview: {
        minHeight: '44px',
        padding: '0 10px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(126, 200, 227, 0.35)',
        background: 'rgba(126, 200, 227, 0.15)',
        color: '#7EC8E3',
        fontSize: '11px',
        fontWeight: 800,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: "'Montserrat', sans-serif",
    },
    adminActionBtnOpenDirect: {
        minHeight: '44px',
        padding: '0 10px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(34, 197, 94, 0.35)',
        background: 'rgba(34, 197, 94, 0.2)',
        color: '#4ade80',
        fontSize: '11px',
        fontWeight: 800,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    adminActionBtnOpenLive: {
        minHeight: '44px',
        padding: '0 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(34, 197, 94, 0.6)',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.9) 100%)',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 900,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
        fontFamily: "'Montserrat', sans-serif",
    },
    adminActionBtnClose: {
        minHeight: '44px',
        padding: '0 10px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#f87171',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    adminActionBtnCloseWide: {
        minHeight: '44px',
        padding: '0 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        background: 'rgba(239, 68, 68, 0.3)',
        color: '#ff8585',
        fontSize: '12px',
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
    },
    previewAlertBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(126, 200, 227, 0.12)',
        border: '1px solid rgba(126, 200, 227, 0.32)',
        marginBottom: '16px',
    },
    previewAlertIcon: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        color: '#052033',
        background: 'linear-gradient(135deg, #7EC8E3 0%, #38bdf8 100%)',
        flexShrink: 0,
    },
    previewAlertContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    previewAlertTitle: {
        color: '#7EC8E3',
        fontSize: '14px',
        fontWeight: 800,
    },
    previewAlertText: {
        color: 'var(--color-text-muted)',
        fontSize: '12px',
        margin: 0,
        lineHeight: 1.4,
    },
    adminActionToolbar: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginBottom: '18px',
    },
    adminOpenLiveBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 900,
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
        fontFamily: "'Montserrat', sans-serif",
    },
    adminCloseLiveBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        background: 'rgba(239, 68, 68, 0.25)',
        color: '#f87171',
        fontSize: '13px',
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
    },
    adminPreviewBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid rgba(126, 200, 227, 0.4)',
        background: 'rgba(126, 200, 227, 0.2)',
        color: '#7EC8E3',
        fontSize: '13px',
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
    },
    candidatoBtnDisabled: {
        opacity: 0.78,
        cursor: 'not-allowed',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.04)',
    },
    badgeEsperandoVoto: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '12px',
        color: 'var(--color-text-soft)',
        fontWeight: 700,
        background: 'rgba(255, 255, 255, 0.08)',
        padding: '4px 8px',
        borderRadius: 'var(--radius-pill)',
    },
    adminToggleBtn: {
        minWidth: '76px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        fontWeight: 900,
        cursor: 'pointer',
        color: 'white',
        padding: '0 12px',
        fontSize: '12px',
        fontFamily: "'Montserrat', sans-serif",
    },
    adminToggleOpen: {
        backgroundColor: 'rgba(34, 197, 94, 0.68)',
    },
    adminToggleClose: {
        backgroundColor: 'rgba(239, 68, 68, 0.68)',
    },
    opcionesContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '22px',
    },
    candidatoBtn: {
        minHeight: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--color-text)',
        padding: '12px 14px',
        fontSize: '15px',
        fontWeight: 800,
        cursor: 'pointer',
        textAlign: 'left',
        background: 'rgba(8, 40, 64, 0.95)',
        border: '1px solid rgba(186, 230, 255, 0.22)',
        boxShadow: 'var(--shadow-soft)',
    },
    candidatoInfo: {
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '13px',
    },
    candidatoPhoto: {
        width: 46,
        height: 46,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid rgba(186, 230, 255, 0.28)',
    },
    candidatoFallback: {
        width: 46,
        height: 46,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        color: '#052033',
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
        fontWeight: 900,
    },
    candidatoName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    voteIcon: {
        color: 'var(--color-accent)',
        flexShrink: 0,
    },
    backBtn: {
        minHeight: '44px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(186, 230, 255, 0.16)',
        borderRadius: 'var(--radius-pill)',
        color: 'var(--color-text-muted)',
        fontSize: '14px',
        fontWeight: 800,
        cursor: 'pointer',
        padding: '0 16px',
        fontFamily: "'Montserrat', sans-serif",
        margin: '0 auto',
    },
    votoConfirmadoCard: {
        borderRadius: 'var(--radius-lg)',
        padding: '44px 24px',
        textAlign: 'center',
        marginTop: '10px',
    },
    statusIconSuccess: {
        width: '72px',
        height: '72px',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 18px',
        borderRadius: '50%',
        color: '#052033',
        background: 'linear-gradient(135deg, #8ce6ff 0%, var(--color-accent-strong) 100%)',
        boxShadow: 'var(--shadow-glow)',
    },
    statusIconPending: {
        width: '72px',
        height: '72px',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 18px',
        borderRadius: '50%',
        color: '#2d1f00',
        background: 'linear-gradient(135deg, #ffd27a 0%, #f59e0b 100%)',
        boxShadow: '0 18px 45px rgba(245, 158, 11, 0.22)',
    },
    votoConfirmadoTitle: {
        fontSize: '24px',
        fontWeight: 900,
        color: 'var(--color-text)',
        margin: '0 0 12px',
    },
    votoConfirmadoText: {
        fontSize: '14px',
        color: 'var(--color-text-muted)',
        lineHeight: 1.6,
        margin: 0,
    },
    pendingBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        marginTop: '18px',
        padding: '9px 14px',
        backgroundColor: 'rgba(245, 158, 11, 0.14)',
        color: '#ffd27a',
        border: '1px solid rgba(245, 158, 11, 0.32)',
        borderRadius: 'var(--radius-pill)',
        fontSize: '13px',
        fontWeight: 800,
    },
};

export default VotarView;
