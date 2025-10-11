// Utilitaires pour interagir avec le Service Worker

/**
 * Vider tout le cache
 */
export const clearCache = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        } else {
          reject(new Error('Échec du nettoyage du cache'));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  throw new Error('Service Worker non disponible');
};

/**
 * Obtenir la taille totale du cache
 */
export const getCacheSize = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.size !== undefined) {
          resolve(event.data.size);
        } else {
          reject(new Error('Impossible d\'obtenir la taille du cache'));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    });
  }
  throw new Error('Service Worker non disponible');
};

/**
 * Formater la taille en bytes vers une taille lisible
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Vérifier si le Service Worker est actif
 */
export const isServiceWorkerActive = () => {
  return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
};

/**
 * Forcer la mise à jour du Service Worker
 */
export const updateServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return registration.update();
    }
  }
  throw new Error('Service Worker non disponible');
};
