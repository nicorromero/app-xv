import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    memoryLocalCache,
    CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";
import { app } from "./app";

// Límite explícito de 40MB para la caché de IndexedDB.
// Sin esto, Firestore usa CACHE_SIZE_UNLIMITED y puede llenar el storage
// de celulares viejos con 64MB de cuota asignada por el SO.
// 40MB es suficiente para todos los documentos del evento (categorías,
// candidatos, config, muro de fotos) con margen amplio.
const CACHE_SIZE_BYTES = 40 * 1024 * 1024; // 40 MB

let db;

try {
    // Intento principal: caché persistente en IndexedDB con multi-tab support.
    // persistentMultipleTabManager usa BroadcastChannel para coordinar tabs.
    // En celulares ajenos con Safari iOS o Chrome Android con RAM baja,
    // IndexedDB puede estar bloqueado (private mode) o corromper el lock.
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
            cacheSizeBytes: CACHE_SIZE_BYTES,
        }),
    });
} catch (err) {
    // Fallback: caché en memoria (session-only).
    // La app funciona con normalidad; los votos offline no persisten
    // si el usuario cierra la tab, pero el voto online sí llega a Firestore.
    console.warn('[db] IndexedDB no disponible, usando memoria:', err?.code || err?.message);
    db = initializeFirestore(app, {
        localCache: memoryLocalCache(),
    });
}

export { db };
