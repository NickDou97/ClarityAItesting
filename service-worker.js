/**
 * ClarityAI Service Worker
 * Provides caching and offline support for the entire site
 */

const CACHE_NAME = 'clarityai-cache-v1.5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/ai-assessment.html',
  '/success.html',
  '/sample-assessment.html',
  '/css/styles.css?v=1.4',
  '/css/assessment.css?v=1.4',
  '/css/header-fix.css',
  '/css/base/index.css',
  '/css/base/variables.css',
  '/css/base/typography.css',
  '/css/base/reset.css',
  '/js/main.js',
  '/js/assessment.js',
  '/js/netlify-integration.js',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
  '/img/profile.jpg',
  '/img/bianca.jpg',
  '/img/andre.jpg',
  '/img/john-mason.jpg'
];

// Local assets that we want to cache (excluding external resources)
const LOCAL_DOMAIN = self.location.origin;

// On install, cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler with safety checks for external resources
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Check if this is a request for our domain or the assets we want to cache
  const url = new URL(event.request.url);
  const isLocalRequest = url.origin === LOCAL_DOMAIN;
  const isSameOriginRequest = event.request.url.startsWith(self.location.origin);
  
  // Only cache same-origin requests to avoid CSP issues
  if (!isSameOriginRequest) {
    // For cross-origin requests, use network only - don't try to cache
    return;
  }

  // Handle local static assets with cache-first strategy
  const isStaticAsset = STATIC_ASSETS.includes(url.pathname) || 
    url.pathname.startsWith('/img/') ||
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then(networkResponse => {
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone))
                .catch(err => console.error('Cache put error:', err));
                
              return networkResponse;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              // Return a fallback response or let the browser handle it
              return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' }});
            });
        })
    );
    return;
  }

  // For all other same-origin requests: network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses from our domain
        if (response.ok && isLocalRequest) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone))
            .catch(err => console.error('Cache put error:', err));
        }
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached response, let the browser handle the error
            return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' }});
          });
      })
  );
});

// Handle background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'assessment-submission') {
    event.waitUntil(syncAssessmentData());
  }
});

// Helper function to sync assessment data when back online
async function syncAssessmentData() {
  try {
    const db = await openDB();
    const pendingSubmissions = await db.getAll('pending-submissions');
    
    if (pendingSubmissions.length === 0) return;
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await db.delete('pending-submissions', submission.id);
        }
      } catch (error) {
        console.error('Failed to sync assessment data:', error);
      }
    }
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('assessment-db', 1);
    
    request.onerror = event => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-submissions')) {
        db.createObjectStore('pending-submissions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Your AI assessment report is ready!',
      icon: '/img/logo-192.png',
      badge: '/img/badge.png',
      data: {
        url: data.url || '/ai-assessment.html'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'AI Assessment Update',
        options
      )
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window open with the target URL
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
}); 