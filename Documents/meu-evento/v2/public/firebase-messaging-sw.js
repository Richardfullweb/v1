// Scripts para o service-worker do Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

// Inicialize o Firebase com as configurações do seu projeto.
firebase.initializeApp({
  apiKey: "AIzaSyBEJt_Z8mggU_ckUCpQjK3-3ArlrBmvPHc",
  authDomain: "ambiente-python-431822.firebaseapp.com",
  projectId: "ambiente-python-431822",
  storageBucket: "ambiente-python-431822.firebasestorage.app",
  messagingSenderId: "952921538910",
  appId: "1:952921538910:web:e3080bad1df2dc94e80fcf"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize a notificação visual aqui
  const notificationTitle = 'Título da Notificação';
  const notificationOptions = {
    body: 'Mensagem da Notificação',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
