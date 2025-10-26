// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    data: payload.data, // Preserve data for click handler
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Add this event listener for notification clicks:
self.addEventListener('notificationclick', function(event) {
  
  event.notification.close();
  const clickAction = event.notification.data?.click_action || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If already open, focus the tab/window
      for (const client of windowClients) {
        if (client.url.includes(clickAction) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});