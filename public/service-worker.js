// Service Worker pour la gestion du cache des images
const CACHE_NAME = 'recette-cuisine-v1';
const IMAGE_CACHE_NAME = 'recette-cuisine-images-v1';

// Fichiers statiques à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des fichiers statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Force le nouveau SW à devenir actif immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Gérer uniquement les requêtes HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Stratégie spéciale pour les images Firebase Storage
  if (isFirebaseStorageImage(url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Stratégie Network First pour les autres requêtes Firebase (Firestore, Auth)
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('cloudfunctions.net')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stratégie Cache First pour les assets statiques
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Par défaut: Network First
  event.respondWith(networkFirst(request));
});

// Vérifier si c'est une image Firebase Storage
function isFirebaseStorageImage(url) {
  return url.hostname.includes('firebasestorage.googleapis.com') &&
         (url.pathname.includes('.jpg') ||
          url.pathname.includes('.jpeg') ||
          url.pathname.includes('.png') ||
          url.pathname.includes('.webp') ||
          url.pathname.includes('.gif'));
}

// Vérifier si c'est un asset statique
function isStaticAsset(url) {
  const pathname = url.pathname;
  return pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.ttf') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico');
}

// Stratégie Cache First avec mise à jour en arrière-plan
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Image servie depuis le cache:', request.url);

    // Mise à jour du cache en arrière-plan (Stale-While-Revalidate)
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore les erreurs de mise à jour en arrière-plan
    });

    return cachedResponse;
  }

  // Si pas en cache, fetch et mettre en cache
  console.log('[Service Worker] Téléchargement et mise en cache de l\'image:', request.url);

  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      // Clone la réponse car elle ne peut être consommée qu'une fois
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Erreur lors du téléchargement de l\'image:', error);

    // Retourner une image placeholder en cas d'erreur
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#1a1a2e"/><text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="14">Image indisponible</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Stratégie Cache First (pour assets statiques)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Erreur réseau:', error);
    throw error;
  }
}

// Stratégie Network First (pour API/Firestore)
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Mettre en cache les réponses réussies si c'est approprié
    if (response && response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // En cas d'erreur réseau, essayer le cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Fallback sur le cache pour:', request.url);
      return cachedResponse;
    }

    throw error;
  }
}

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

// Calculer la taille du cache
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}
