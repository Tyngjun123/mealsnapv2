self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'MealSnap'
  const options = {
    body: data.body ?? "Don't forget to log your meals today!",
    icon: '/api/icon/192',
    badge: '/api/icon/192',
    data: data.url ? { url: data.url } : {},
    vibrate: [100, 50, 100],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(clients.openWindow(url))
})
