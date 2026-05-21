import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from '../context/AuthContext.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'

// Este listener detecta cuando el usuario vuelve a la pestaña de la PWA.
// Si hay un Service Worker activo, le exige que busque actualizaciones en Firebase.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            console.log('[SW] Buscando actualizaciones en segundo plano...');
            registration.update();
        }).catch(err => {
            console.warn('[SW] No se pudo comprobar la actualización:', err);
        });
    }
});
// -------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

