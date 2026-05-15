import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, CloudOff, Hourglass, Lock, Star } from 'lucide-react';
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
    const { votacionActiva, toggleCategoria } = useVotaciones();
    const { emitirVoto, pendingSync, syncPendingVotes } = useResultadosVotos();

    const [catSeleccionada, setCatSeleccionada] = useState(null);
    const [votoTemporal, setVotoTemporal] = useState(null);

    const categoriasActivas = categorias.filter(cat => votacionActiva[cat.id] === true);
    const isForcedClient = !isAdmin && categoriasActivas.length > 0;
    const categoriaARenderizar = isForcedClient ? categoriasActivas[0] : catSeleccionada;

    const handleVoto = async (categoria, candidato) => {
        await emitirVoto(categoria.id, candidato, isOnline);

        if (!isAdmin) {
            setVotoTemporal(categoria.id);
        } else {
            setCatSeleccionada(null);
        }
    };

    useEffect(() => {
        if (isOnline && pendingSync > 0) {
            const timer = setTimeout(() => {
                syncPendingVotes();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOnline, pendingSync, syncPendingVotes]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setVotoTemporal(null); }, [categoriaARenderizar?.id, votacionActiva]);

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

        return (
            <div style={styles.container}>
                <HeaderBlock
                    title={categoriaARenderizar.titulo}
                    subtitle="Elegí a tu favorito"
                    variant="vote"
                />

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
                            style={styles.candidatoBtn}
                            aria-label={`Votar por ${c.nombre}`}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ y: -1 }}
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
                            <CheckCircle2 size={20} style={styles.voteIcon} />
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
                        const isCatActive = votacionActiva[cat.id] === true;
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
                                    onClick={() => { if (isCatActive) setCatSeleccionada(cat); }}
                                    aria-label={isCatActive ? `Ver candidatos para ${cat.titulo}` : `Categoría ${cat.titulo} cerrada`}
                                    disabled={!isCatActive}
                                    className="app-button"
                                    style={{
                                        ...styles.categoriaBtn,
                                        ...(isCatActive ? styles.categoriaBtnActive : styles.categoriaBtnClosed),
                                    }}
                                    whileTap={isCatActive ? { scale: 0.98 } : undefined}
                                    whileHover={isCatActive ? { y: -1 } : undefined}
                                >
                                    <span style={isCatActive ? styles.categoryStatusActive : styles.categoryStatusClosed}>
                                        {isCatActive ? <Star size={16} /> : <Lock size={15} />}
                                    </span>
                                    <span style={styles.categoryText}>
                                        <span style={styles.categoryTitle}>{cat.titulo}</span>
                                        <span style={styles.categoryMeta}>
                                            {isCatActive ? 'Votación abierta' : 'Aún no disponible'}
                                        </span>
                                    </span>
                                    {isCatActive && <ChevronRight size={19} style={styles.chevronIcon} />}
                                </MotionButton>

                                {isAdmin && (
                                    <MotionButton
                                        type="button"
                                        onClick={() => toggleCategoria(cat.id)}
                                        className="app-button"
                                        style={{
                                            ...styles.adminToggleBtn,
                                            ...(isCatActive ? styles.adminToggleClose : styles.adminToggleOpen),
                                        }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        {isCatActive ? 'Cerrar' : 'Abrir'}
                                    </MotionButton>
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
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: 'var(--shadow-soft)',
    },
    categoriaBtnActive: {
        border: '1px solid rgba(105, 200, 242, 0.34)',
        background: 'rgba(13, 52, 82, 0.78)',
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
        background: 'rgba(13, 52, 82, 0.68)',
        border: '1px solid rgba(186, 230, 255, 0.22)',
        boxShadow: 'var(--shadow-soft)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
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
