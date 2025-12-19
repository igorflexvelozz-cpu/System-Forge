// Authentication Hook
// React hook for Firebase Authentication

import { useState, useEffect } from "react";
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  getCurrentUser,
  onAuthChange,
  isAuthenticated,
  getUserDisplayName,
  getUserEmail,
  getUserId
} from "@/lib/auth";
import { User } from "firebase/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: getCurrentUser(),
    loading: true,
    authenticated: isAuthenticated()
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setAuthState({
        user,
        loading: false,
        authenticated: user !== null
      });
    });

    return () => unsubscribe();
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    resetPassword,
    displayName: getUserDisplayName(),
    email: getUserEmail(),
    userId: getUserId()
  };
}
