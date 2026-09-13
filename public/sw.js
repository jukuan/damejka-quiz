const CACHE_NAME = 'damejka-__SW_VERSION__'
const APP_SHELL = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(APP_SHELL)
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigation: network-first. Cache the response under both the requested
  // URL and the canonical /index.html key so offline fallback works.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy.clone())
            cache.put('/index.html', copy)
          })
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match('/index.html')
        }),
    )
    return
  }

  // Hashed Vite assets: cache-first (URL changes with content).
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        if (cached) return cached

        const response = await fetch(request)
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })(),
    )
    return
  }

  // Everything else: network-first with cache fallback.
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request)
      return cached || new Response('', { status: 504, statusText: 'Offline' })
    }),
  )
})
