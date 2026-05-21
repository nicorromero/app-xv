import { Component } from 'react';

const CHUNK_RETRY_KEY  = 'eb_chunk_retries';
const MAX_AUTO_RETRIES = 1; // un solo reload silencioso

/**
 * Clasifica el error para saber qué mensaje y comportamiento mostrar.
 * Devuelve 'chunk' | 'network' | 'generic'
 */
function classifyError(error) {
    const msg = error?.message || '';

    const isChunkLoad =
        error?.name === 'ChunkLoadError' ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('Loading chunk') ||
        msg.includes('Loading CSS chunk');

    if (isChunkLoad) return 'chunk';

    const isNetwork =
        error?.name === 'TypeError' && (
            msg.includes('Failed to fetch') ||
            msg.includes('NetworkError') ||
            msg.includes('Load failed')     // Safari
        );

    if (isNetwork) return 'network';

    return 'generic';
}

/**
 * Lee el contador de reintentos del sessionStorage.
 * sessionStorage se borra al cerrar la pestaña, así que el contador
 * se reinicia solo en cada sesión nueva. Perfecto para el evento.
 */
function getRetryCount() {
    try {
        return parseInt(sessionStorage.getItem(CHUNK_RETRY_KEY) || '0', 10);
    } catch {
        return MAX_AUTO_RETRIES; // si sessionStorage no está disponible, no reintentar
    }
}

function incrementRetryCount() {
    try {
        const next = getRetryCount() + 1;
        sessionStorage.setItem(CHUNK_RETRY_KEY, String(next));
        return next;
    } catch {
        return MAX_AUTO_RETRIES + 1;
    }
}

function clearRetryCount() {
    try { sessionStorage.removeItem(CHUNK_RETRY_KEY); } catch { /* noop */ }
}

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError:   false,
            errorType:  null,   // 'chunk' | 'network' | 'generic'
            autoReloading: false,
        };
    }

    static getDerivedStateFromError(error) {
        const errorType = classifyError(error);
        return { hasError: true, errorType };
    }

    componentDidCatch(error) {
        const errorType = classifyError(error);

        // ── Errores de chunk (módulo no descargado) ──────────────────────────
        if (errorType === 'chunk') {

            // Si el celular está offline, no tiene sentido hacer reload.
            // Mostrar error de red directamente.
            if (!navigator.onLine) {
                this.setState({ autoReloading: false });
                return;
            }

            const retries = getRetryCount();

            if (retries < MAX_AUTO_RETRIES) {
                // Primer intento: reload silencioso (puede ser caché obsoleta).
                incrementRetryCount();
                this.setState({ autoReloading: true });
                setTimeout(() => window.location.reload(), 1000);
            } else {
                // Ya intentamos una vez y volvió a fallar → problema de red real.
                // Detenemos el ciclo y mostramos error manual.
                this.setState({ autoReloading: false });
            }
            return;
        }

        // Cualquier otro error: mostrar pantalla de error genérica sin reload.
        this.setState({ autoReloading: false });
    }

    handleManualRetry = () => {
        clearRetryCount();
        this.setState({ hasError: false, errorType: null, autoReloading: false });
        // El setState basta para desmontar la UI de error y volver a montar
        // el árbol de React. Si el chunk sigue sin cargar, el boundary lo
        // capturará de nuevo y el usuario verá el error otra vez.
        // Para forzar una descarga fresca del chunk, usamos reload():
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        const { errorType, autoReloading } = this.state;
        const isOffline = !navigator.onLine;

        // ── Estado: reload silencioso en progreso ────────────────────────────
        if (autoReloading) {
            return (
                <div style={s.container}>
                    <div style={s.ambientGlow} />
                    <div style={s.card}>
                        <div style={s.iconWrapper}>
                            <span style={s.spinnerRing} aria-hidden="true" />
                        </div>
                        <h1 style={s.title}>Cargando...</h1>
                        <p style={s.message}>Estamos preparando la app para vos.</p>
                    </div>
                </div>
            );
        }

        // ── Mensajes según tipo de error ─────────────────────────────────────
        let icon, title, message;

        if (errorType === 'chunk' || errorType === 'network' || isOffline) {
            icon    = '📶';
            title   = 'Tuvimos un problema de conexión al cargar esta pantalla';
            message = isOffline
                ? 'Tu celular no tiene señal en este momento. Cuando recuperes conexión, tocá "Reintentar".'
                : 'La red del salón está saturada. Esperá unos segundos y tocá "Reintentar".';
        } else {
            icon    = '✨';
            title   = 'Algo salió mal';
            message = 'Ocurrió un error inesperado. Tocá el botón para volver a intentar.';
        }

        return (
            <div style={s.container}>
                <div style={s.ambientGlow} />
                <div style={s.card}>
                    <div style={s.iconWrapper}>
                        <span style={s.icon} role="img" aria-label="Error">{icon}</span>
                    </div>

                    <h1 style={s.title}>{title}</h1>
                    <p  style={s.message}>{message}</p>

                    <button
                        id="btn-error-reload"
                        style={s.button}
                        onClick={this.handleManualRetry}
                    >
                        Reintentar
                    </button>

                    {(errorType === 'chunk' || errorType === 'network') && !isOffline && (
                        <p style={s.hint}>
                            Si el problema persiste, cerrá y volvé a abrir la página desde el QR.
                        </p>
                    )}
                </div>
            </div>
        );
    }
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const s = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Montserrat', sans-serif",
        background: 'linear-gradient(180deg, #061a2f 0%, #0a2540 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    ambientGlow: {
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(105, 200, 242, 0.08)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
    },
    card: {
        position: 'relative',
        zIndex: 1,
        maxWidth: '340px',
        width: '100%',
        background: 'rgba(13, 52, 82, 0.6)',
        border: '1px solid rgba(105, 200, 242, 0.18)',
        borderRadius: '24px',
        padding: '40px 28px',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
    },
    iconWrapper: {
        width: '72px',
        height: '72px',
        margin: '0 auto 20px',
        background: 'rgba(105, 200, 242, 0.10)',
        border: '1px solid rgba(105, 200, 242, 0.22)',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
    },
    icon: {
        fontSize: '32px',
        lineHeight: 1,
    },
    // Spinner CSS puro (no depende de ningún chunk externo)
    spinnerRing: {
        display: 'block',
        width: '32px',
        height: '32px',
        border: '3px solid rgba(105, 200, 242, 0.2)',
        borderTopColor: '#69c8f2',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
    },
    title: {
        fontSize: '18px',
        fontWeight: 900,
        color: '#e8f4ff',
        margin: '0 0 12px',
        lineHeight: 1.3,
        textWrap: 'balance',
    },
    message: {
        fontSize: '14px',
        color: 'rgba(186, 230, 255, 0.7)',
        lineHeight: 1.65,
        margin: '0 0 28px',
        textWrap: 'balance',
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50px',
        width: '100%',
        background: 'linear-gradient(135deg, #69c8f2 0%, #2d9fe0 100%)',
        color: '#052033',
        border: 'none',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
        boxShadow: '0 12px 32px rgba(45, 159, 224, 0.28)',
    },
    hint: {
        fontSize: '12px',
        color: 'rgba(186, 230, 255, 0.38)',
        lineHeight: 1.5,
        marginTop: '16px',
        textWrap: 'balance',
    },
};
