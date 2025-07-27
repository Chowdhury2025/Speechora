self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Define navigation routes
const navigationRoutes = [
  '/app/*',
  '/login',
  '/register',
  '/forgot-password',
  '/icons/*'
];

// Handle navigation requests
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    const isNavigationRoute = navigationRoutes.some(route => {
      if (route.endsWith('*')) {
        const baseRoute = route.slice(0, -1);
        return url.pathname.startsWith(baseRoute);
      }
      return url.pathname === route;
    });

    if (isNavigationRoute) {
      event.respondWith(
        fetch(event.request)
          .catch(() => caches.match('/index.html'))
      );
    }
  }
});
