import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBTSXODTcX6CS0cbDImViTTsgCw_WuB6Bk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "estudos-enare.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "estudos-enare",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "estudos-enare.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "901184648398",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:901184648398:web:30747e80dd12818eb80c9f",
};

const DATABASE_ID = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-eyshilacaxiasest-81535c31-6992-4dcd-bd37-f8ec5a40e09a";

export let isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

export let app: FirebaseApp | null = null;
export let db: Firestore | null = null;
export let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, DATABASE_ID); // Initialize with DATABASE_ID
    auth = getAuth(app);
    console.log("🔥 Firebase conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar o Firebase:", error);
  }
} else {
  console.warn("⚠️ O Firebase não está configurado. O aplicativo tentou carregar sem as chaves corretas.");
}

// Keep a dummy initFirebase to satisfy main.tsx without changing too much, or we can remove it from main.tsx
export async function initFirebase(): Promise<boolean> {
  return isFirebaseConfigured;
}

