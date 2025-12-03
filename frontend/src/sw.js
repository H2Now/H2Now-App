import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('offline-cache').then(cache => {
      return cache.addAll([
        '/offline.html',
        '/images/logo.jpg',
        '/fonts/Montserrat-Regular.ttf'
      ])
    })
  )
})

registerRoute(
  ({ request }) => request.mode === 'navigate',
  async () => {
    try {
      return await new NetworkOnly().handle({ request })
    } catch (err) {
      return caches.match('/offline.html')
    }
  }
)
