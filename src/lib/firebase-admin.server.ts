import { getApps, initializeApp, getApp, cert } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

let app;

const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.VITE_FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.VITE_FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

// Try to load service-account.json from the project root
let serviceAccount = null;
try {
  const saPath = join(process.cwd(), "service-account.json");
  if (existsSync(saPath)) {
    serviceAccount = JSON.parse(readFileSync(saPath, "utf8"));
  }
} catch (e) {
  console.warn("Could not check or read service-account.json, falling back to env:", e);
}

if (getApps().length === 0) {
  if (serviceAccount) {
    try {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service-account.json.");
    } catch (e) {
      console.error("Failed to initialize Firebase Admin SDK with service-account.json:", e);
    }
  } else if (privateKey && clientEmail && projectId) {
    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin SDK initialized with service account from env.");
    } catch (e) {
      console.error("Failed to initialize Firebase Admin SDK with service account, falling back:", e);
    }
  } else if (projectId) {
    try {
      app = initializeApp({
        projectId,
      });
      console.log(`Firebase Admin SDK initialized with project ID: ${projectId}`);
    } catch (e) {
      console.error("Failed to initialize Firebase Admin SDK with project ID:", e);
    }
  } else {
    // Attempt automatic default credentials loading
    try {
      app = initializeApp();
      console.log("Firebase Admin SDK initialized with default credentials.");
    } catch (e) {
      console.warn("Firebase Admin SDK could not find configuration. Firestore operations will fail.");
    }
  }
} else {
  app = getApp();
}

export const adminAuth = app ? getAuth(app) : null;
export const adminDb = app ? getFirestore(app) : null;
