/**
 * Cache clearing and service worker refresh script
 * Forces reload of service worker with new cache version
 */

// Check if service worker exists and unregister it to clear cache
if ('serviceWorker' in navigator) {
  // First, try to unregister any existing service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister().then(function() {
        console.log('Successfully unregistered service worker');
      }).catch(function(error) {
        console.error('Error unregistering service worker:', error);
      });
    }
  });

  // Then clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('All caches cleared successfully');
      
      // After clearing caches, register the service worker again
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Force page reload once to ensure latest assets are loaded
const cacheReloadParam = 'cache-reload';
if (!window.location.search.includes(cacheReloadParam)) {
  // Add a parameter to the URL to prevent infinite reload
  const separator = window.location.search ? '&' : '?';
  const newUrl = window.location.href + separator + cacheReloadParam + '=true';
  
  // Store a flag in sessionStorage to prevent redirect on back navigation
  if (!sessionStorage.getItem('cache-cleared')) {
    sessionStorage.setItem('cache-cleared', 'true');
    window.location.href = newUrl;
  }
} 