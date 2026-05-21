import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthAsync } from '../services/firebase/app';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authInstance, setAuthInstance] = useState(null);

    const ADMIN_EMAILS_STRING = import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || "nicoromerofrcu@gmail.com";
    const ADMIN_EMAILS = ADMIN_EMAILS_STRING.split(',').map(e => e.trim());

    useEffect(() => {
        let unsubscribe;
        const initAuth = async () => {
            try {
                const auth = await getAuthAsync();
                setAuthInstance(auth);
                const { onAuthStateChanged } = await import('firebase/auth');
                unsubscribe = onAuthStateChanged(auth, (user) => {
                    setCurrentUser(user);
                    setLoading(false);
                });
            } catch (err) {
                console.error("Auth init error:", err);
                setLoading(false);
            }
        };
        initAuth();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Safe null-check: anonymous users have email === null
    const isAdmin = Boolean(currentUser?.email && ADMIN_EMAILS.includes(currentUser.email));
    const isAnonymous = currentUser?.isAnonymous === true;
    const isGuest = currentUser !== null && !isAdmin;

    /**
     * Flujo principal de invitados: login anónimo con un toque.
     * No genera perfil en Firestore para evitar escrituras innecesarias.
     */
    const signInAsGuest = async () => {
        if (!authInstance) throw new Error('Auth no inicializado');
        const { signInAnonymously } = await import('firebase/auth');
        return signInAnonymously(authInstance);
    };

    /**
     * Flujo secundario de staff: login con Google.
     */
    const signInWithGoogle = async () => {
        if (!authInstance) throw new Error('Auth no inicializado');
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        return signInWithPopup(authInstance, provider);
    };

    const logout = async () => {
        if (!authInstance) return;
        try {
            const { signOut } = await import('firebase/auth');
            await signOut(authInstance);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const value = {
        currentUser,
        isAdmin,
        isAnonymous,
        isGuest,
        signInAsGuest,
        signInWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
