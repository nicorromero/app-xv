import { initializeApp } from "firebase/app";
import { getPerformance } from "firebase/performance";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredConfigKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
];

export const hasFirebaseConfig = requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));

export const app = initializeApp(firebaseConfig);
export const perf = hasFirebaseConfig ? getPerformance(app) : null;

if (!hasFirebaseConfig) {
    console.warn('Firebase config incompleta. Completá las variables VITE_FIREBASE_* en .env para usar auth, firestore y performance.');
}

let authInstance = null;
export const getAuthAsync = async () => {
    if (!authInstance) {
        const { getAuth } = await import('firebase/auth');
        authInstance = getAuth(app);
    }
    return authInstance;
};
