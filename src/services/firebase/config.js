// src/services/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDxoDbGE3YUaTEUC6brrww8UC9ZKeHAAIk",
  authDomain: "daily-tracker-3c0b2.firebaseapp.com",
  projectId: "daily-tracker-3c0b2",
  storageBucket: "daily-tracker-3c0b2.firebasestorage.app",
  messagingSenderId: "259016823902",
  appId: "1:259016823902:web:8d3c8e2c7dd1cded8fd0cf",
  measurementId: "G-SV3FKQKZZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;