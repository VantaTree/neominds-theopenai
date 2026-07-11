import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
let storage: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app, "gs://theopenai.firebasestorage.app");
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.warn(
    "Firebase environment variables are not fully configured. The application is running in mock fallback mode."
  );
}

export async function uploadFileToStorage(
  file: File,
  entityType: "users" | "businesses" | "blogs",
  entityId: string,
  folderName: "profileImg" | "businessImg" | "blogImg"
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    console.warn("Firebase not configured. Using fallback local base64 for preview.");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64 mock URL"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  const fileExtension = file.name.split(".").pop() || "png";
  const randomId = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  const filename = `${timestamp}-${randomId}.${fileExtension}`;

  const storageRef = ref(storage, `${entityType}/${entityId}/${folderName}/${filename}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
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

export { app, auth, db, storage, isFirebaseConfigured };
