
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGhuKbxsaC8_RLoBoHoQflWTsraJPwGtg",
  authDomain: "disastersolution-2955f.firebaseapp.com",
  projectId: "disastersolution-2955f",
  storageBucket: "disastersolution-2955f.firebasestorage.app",
  messagingSenderId: "753003793588",
  appId: "1:753003793588:web:cc68bcff3537c435401be1",
  measurementId: "G-W0SJ7RNEJC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
