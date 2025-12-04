import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'
import { CacheFirst } from 'workbox-strategies'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('offline-cache').then(cache =>
      cache.addAll([
        '/offline.html',
        '/images/logo.jpg',
        '/fonts/Montserrat-Regular.ttf',
        '/favicon.ico'
      ])
    )
  )
})

registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      const response = await fetch(event.request)
      if (response && response.status === 200) return response
      return response
    } catch (err) {
      return caches.match('/offline.html', { ignoreSearch: true })
    }
  }
)

registerRoute(
  ({ request }) => request.destination === 'image' && request.url.endsWith('/favicon.ico'),
  new CacheFirst({ cacheName: 'offline-cache' })
)

registerRoute(
  ({ request }) =>
    request.destination === 'image' && request.url.includes('/images/logo.jpg'),
  new CacheFirst({ cacheName: 'offline-cache' })
)

registerRoute(
  ({ request }) =>
    request.destination === 'font' && request.url.includes('/fonts/Montserrat-Regular.ttf'),
  new CacheFirst({ cacheName: 'offline-cache' })
)
