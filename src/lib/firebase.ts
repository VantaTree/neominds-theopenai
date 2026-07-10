import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if credentials are set
const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: any;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.warn(
    "Firebase environment variables are not fully configured. The application is running in mock fallback mode."
  );
}

// Track if auth has resolved at least once
let authResolved = false;
let currentUser: User | null = null;
const initListeners = new Set<() => void>();

if (auth) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authResolved = true;
    initListeners.forEach((resolve) => resolve());
    initListeners.clear();
  });
} else {
  authResolved = true;
}

export function isAuthInitialized(): boolean {
  if (auth && auth.currentUser) {
    authResolved = true;
  }
  return authResolved;
}

export function waitUntilAuthInitialized(): Promise<void> {
  if (isAuthInitialized()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    initListeners.add(resolve);
  });
}

export function getFirebaseAuthUser(): Promise<User | null> {
  if (isAuthInitialized()) {
    return Promise.resolve(auth ? auth.currentUser : null);
  }
  return new Promise((resolve) => {
    initListeners.add(() => {
      resolve(auth ? auth.currentUser : null);
    });
  });
}

export { app, auth, db, isFirebaseConfigured };
