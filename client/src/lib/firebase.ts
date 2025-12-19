// Firebase Configuration and Initialization
// Professional setup for Flex Velozz | ATLAS

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration from Firebase Console
// Project: forge-velozz
const firebaseConfig = {
  apiKey: "AIzaSyB5uM4vjiUQv8zh1y1yUNpJEdDPNdYSxO4",
  authDomain: "forge-velozz.firebaseapp.com",
  projectId: "forge-velozz",
  storageBucket: "forge-velozz.firebasestorage.app",
  messagingSenderId: "1061841859966",
  appId: "1:1061841859966:web:5fcb9b71940311bca66f2f",
  measurementId: "G-WPL85JGSPC"
};

// Initialize Firebase App (singleton pattern)
let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase services
 * Uses singleton pattern to prevent multiple initializations
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  analytics: Analytics | null;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
} {
  // Return existing app if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
  }

  // Initialize Analytics (only in browser environment and if supported)
  if (typeof window !== "undefined" && !analytics) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app!);
        console.log("[Firebase] Analytics initialized");
      } else {
        console.warn("[Firebase] Analytics not supported in this environment");
      }
    });
  }

  // Initialize Firestore
  if (!firestore) {
    firestore = getFirestore(app);
    console.log("[Firebase] Firestore initialized");
  }

  // Initialize Auth
  if (!auth) {
    auth = getAuth(app);
    console.log("[Firebase] Auth initialized");
  }

  // Initialize Storage
  if (!storage) {
    storage = getStorage(app);
    console.log("[Firebase] Storage initialized");
  }

  return {
    app: app!,
    analytics,
    firestore: firestore!,
    auth: auth!,
    storage: storage!
  };
}

/**
 * Get Firebase App instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    return initializeFirebase().app;
  }
  return app;
}

/**
 * Get Analytics instance
 */
export function getFirebaseAnalytics(): Analytics | null {
  if (!app) {
    initializeFirebase();
  }
  return analytics;
}

/**
 * Get Firestore instance
 */
export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    return initializeFirebase().firestore;
  }
  return firestore;
}

/**
 * Get Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    return initializeFirebase().auth;
  }
  return auth;
}

/**
 * Get Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    return initializeFirebase().storage;
  }
  return storage;
}

/**
 * Log custom event to Firebase Analytics
 */
export async function logAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, any>
): Promise<void> {
  try {
    const analyticsInstance = getFirebaseAnalytics();
    if (analyticsInstance && typeof window !== "undefined") {
      const { logEvent } = await import("firebase/analytics");
      logEvent(analyticsInstance, eventName, eventParams);
      console.log(`[Analytics] Event logged: ${eventName}`, eventParams);
    }
  } catch (error) {
    console.warn(`[Analytics] Failed to log event ${eventName}:`, error);
  }
}

/**
 * Set user properties in Analytics
 */
export async function setAnalyticsUserProperty(
  propertyName: string,
  value: string
): Promise<void> {
  try {
    const analyticsInstance = getFirebaseAnalytics();
    if (analyticsInstance && typeof window !== "undefined") {
      const { setUserProperties } = await import("firebase/analytics");
      setUserProperties(analyticsInstance, { [propertyName]: value });
      console.log(`[Analytics] User property set: ${propertyName} = ${value}`);
    }
  } catch (error) {
    console.warn(`[Analytics] Failed to set user property:`, error);
  }
}

// Export config for external use if needed
export { firebaseConfig };
