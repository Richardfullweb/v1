import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBEJt_Z8mggU_ckUCpQjK3-3ArlrBmvPHc",
  authDomain: "ambiente-python-431822.firebaseapp.com",
  projectId: "ambiente-python-431822",
  storageBucket: "ambiente-python-431822.firebasestorage.app",
  messagingSenderId: "952921538910",
  appId: "1:952921538910:web:e3080bad1df2dc94e80fcf",
  measurementId: "G-8TV19DH24E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firebase persistence failed to enable: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not supported in this browser');
    }
  });

const analytics = getAnalytics(app);

const messaging = getMessaging(app);

export { auth, db, analytics, messaging };
