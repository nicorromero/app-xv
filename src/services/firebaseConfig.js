import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Para los votos y trivias
import { getStorage } from "firebase/storage";    // Para que suban fotos

const firebaseConfig = {
    apiKey: "AIzaSyB7EJMvc_dxFDfFpjwHsGTf2iLykNSnmJ0",
    authDomain: "app-xv-nicor.firebaseapp.com",
    projectId: "app-xv-nicor",
    storageBucket: "app-xv-nicor.firebasestorage.app",
    messagingSenderId: "212448380257",
    appId: "1:212448380257:web:a8b54d580229bc81153120"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en las pantallas de la App
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
