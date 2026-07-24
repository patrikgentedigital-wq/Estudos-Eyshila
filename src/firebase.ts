import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const DATABASE_ID = import.meta.env.VITE_FIREBASE_DATABASE_ID;

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
    db = DATABASE_ID ? getFirestore(app, DATABASE_ID) : getFirestore(app);
    auth = getAuth(app);
    console.log("🔥 Firebase conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar o Firebase:", error);
  }
} else {
  console.warn("⚠️ Firebase não configurado. Defina as variáveis VITE_FIREBASE_* nas configurações de ambiente.");
}

export async function initFirebase(): Promise<boolean> {
  return isFirebaseConfigured;
}
