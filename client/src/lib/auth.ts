// Firebase Authentication System
// Professional authentication layer

import {
  getFirebaseAuth,
  getFirebaseApp
} from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from "firebase/auth";
import { logAnalyticsEvent } from "./firebase";

const auth = getFirebaseAuth();

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    
    await logAnalyticsEvent("user_login", {
      method: "email",
      user_id: credential.user.uid
    });

    return credential;
  } catch (error: any) {
    await logAnalyticsEvent("user_login_failed", {
      method: "email",
      error: error.code || error.message
    });
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    await logAnalyticsEvent("user_signup", {
      method: "email",
      user_id: credential.user.uid
    });

    return credential;
  } catch (error: any) {
    await logAnalyticsEvent("user_signup_failed", {
      method: "email",
      error: error.code || error.message
    });
    throw error;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    const credential = await signInWithPopup(auth, provider);
    
    await logAnalyticsEvent("user_login", {
      method: "google",
      user_id: credential.user.uid
    });

    return credential;
  } catch (error: any) {
    await logAnalyticsEvent("user_login_failed", {
      method: "google",
      error: error.code || error.message
    });
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  try {
    const user = auth.currentUser;
    await signOut(auth);
    
    if (user) {
      await logAnalyticsEvent("user_logout", {
        user_id: user.uid
      });
    }
  } catch (error: any) {
    console.error("[Auth] Sign out error:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    await logAnalyticsEvent("password_reset_requested", {
      email
    });
  } catch (error: any) {
    await logAnalyticsEvent("password_reset_failed", {
      error: error.code || error.message
    });
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Get user display name
 */
export function getUserDisplayName(): string | null {
  return auth.currentUser?.displayName || null;
}

/**
 * Get user email
 */
export function getUserEmail(): string | null {
  return auth.currentUser?.email || null;
}

/**
 * Get user ID
 */
export function getUserId(): string | null {
  return auth.currentUser?.uid || null;
}
