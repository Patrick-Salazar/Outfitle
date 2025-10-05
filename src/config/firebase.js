import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCc1fqfRg-0v6ULnUnWA-BR5rXdydrs1S4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "outfitle-4b314.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "outfitle-4b314",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "outfitle-4b314.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "373582973295",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:373582973295:web:63d7c0eaa2eb0fd781009a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Z4L5KT8TJ8"
};

console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? '✓ Present' : '✗ Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
