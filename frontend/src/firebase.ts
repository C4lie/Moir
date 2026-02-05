import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3sbbk29E955OV8Jb64SP-jYmbq1ZBd2Y",
  authDomain: "moir-app.firebaseapp.com",
  projectId: "moir-app",
  storageBucket: "moir-app.firebasestorage.app",
  messagingSenderId: "103746165605",
  appId: "1:103746165605:web:8a2636de99227be3e55f8c",
  measurementId: "G-46FZ68BTCM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };
export default app;
