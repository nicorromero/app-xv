import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { app } from "./app";

export const db = getFirestore(app);

// Habilitar caché offline para que la app responda sin internet
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistencia offline falló: Múltiples pestañas abiertas');
    } else if (err.code == 'unimplemented') {
        console.warn('El navegador no soporta persistencia offline');
    }
});
