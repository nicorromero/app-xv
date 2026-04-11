import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"; // Para los votos y trivias
import { getStorage } from "firebase/storage";    // Para que suban fotos
import { getAuth } from "firebase/auth";          // Para autenticar administrador

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en las pantallas de la App
export const db = getFirestore(app);

// Habilitar caché offline para que la app responda sin internet
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistencia offline falló: Múltiples pestañas abiertas');
    } else if (err.code == 'unimplemented') {
        console.warn('El navegador no soporta persistencia offline');
    }
});
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
