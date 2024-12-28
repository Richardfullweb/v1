import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    import { getAnalytics } from "firebase/analytics";

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
    const analytics = getAnalytics(app);

    export { auth, db, analytics };
