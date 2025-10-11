import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Utiliser le chemin avec la base configurée dans vite.config.js
    const swPath = '/recette-cuisine/service-worker.js';

    navigator.serviceWorker
      .register(swPath, { scope: '/recette-cuisine/' })
      .then((registration) => {
        console.log('[App] Service Worker enregistré avec succès:', registration.scope);

        // Écouter les mises à jour du Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] Nouvelle version du Service Worker détectée');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau SW disponible, mais ancien encore actif
              console.log('[App] Nouvelle version disponible. Rechargez la page pour l\'activer.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('[App] Erreur lors de l\'enregistrement du Service Worker:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
