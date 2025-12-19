// Authentication Provider Component
// Provides authentication context to the application

import { createContext, useContext, ReactNode } from "react";
import { useAuth, AuthState } from "@/hooks/use-auth";
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOutUser,
  resetPassword
} from "@/lib/auth";

interface AuthContextType extends AuthState {
  signIn: typeof signIn;
  signUp: typeof signUp;
  signInWithGoogle: typeof signInWithGoogle;
  signOut: typeof signOutUser;
  resetPassword: typeof resetPassword;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
