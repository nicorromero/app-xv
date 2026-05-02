import { renderHook, act } from '@testing-library/react';
import { useResultadosVotos } from '../useResultadosVotos';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../services/firebase/app', () => ({
    app: {},
    perf: {}
}));

vi.mock('../../../services/firebase/db', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    onSnapshot: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    increment: vi.fn(n => n),
    initializeFirestore: vi.fn(() => ({})),
    persistentLocalCache: vi.fn(),
    persistentMultipleTabManager: vi.fn()
}));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({ currentUser: { uid: 'test-user' } })),
    onAuthStateChanged: vi.fn((auth, callback) => {
        callback({ uid: 'test-user' });
        return () => {};
    })
}));

vi.mock('firebase/performance', () => ({
    getPerformance: vi.fn(() => ({})),
    trace: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() }))
}));

vi.mock('../../../services/firebase/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn()
    }
}));

describe('useResultadosVotos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('debe inicializar con votos vacíos y pendingSync en 0', () => {
        const { result } = renderHook(() => useResultadosVotos());
        expect(result.current.votos).toEqual({});
        expect(result.current.pendingSync).toBe(0);
    });

    it('debe encolar un voto si está offline', async () => {
        const { result } = renderHook(() => useResultadosVotos());
        
        await act(async () => {
            const res = await result.current.emitirVoto('cat1', 'candidato1', false);
            expect(res.queued).toBe(true);
        });

        expect(result.current.pendingSync).toBe(1);
        const queue = JSON.parse(localStorage.getItem('offline_sync_queue'));
        expect(queue.length).toBe(1);
        expect(queue[0].data.candidato).toBe('candidato1');
    });

    it('debe marcar el voto en localStorage inmediatamente (Optimistic UI)', async () => {
        const { result } = renderHook(() => useResultadosVotos());
        
        await act(async () => {
            await result.current.emitirVoto('cat1', 'candidato1', true);
        });

        expect(localStorage.getItem('voto_cat1')).toBe('true');
    });
});
