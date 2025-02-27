import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  User,
  AuthError,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/services/firestore/users";
import { initializeMessaging } from "@/store/messaging";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: React.ReactNode }): JSX.Element {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider useEffect triggered");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log("AuthStateChanged user:", user);
      if (user) {
        // Initialize messaging store when user is authenticated
        initializeMessaging(user.uid);
      }
      setLoading(false);
      console.log("AuthProvider loading state:", loading);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user);
    } catch (err) {
      console.error("Sign up error:", err);
      if (err instanceof FirebaseError) {
        throw err;
      }
      throw new Error("Failed to create account");
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log("signIn function called", { email });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("signIn successful");
    } catch (err) {
      console.error("Sign in error:", err);
      if (err instanceof FirebaseError) {
        throw err;
      }
      throw new Error("Failed to sign in");
    }
  };

  const signUpWithGoogle = async (): Promise<User> => {
    try {
      console.log("Google Sign-in started");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      console.log("Calling signInWithPopup");
      const result = await signInWithPopup(auth, provider);
      console.log("signInWithPopup successful", result);

      await createUserProfile(result.user);
      
      return result.user;
    } catch (err) {
      console.error("Google sign in error:", err);
      console.error("Google sign-in error object:", err);
      if (err instanceof FirebaseError) {
        throw err;
      }
      throw new Error("Failed to sign in with Google");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      if (err instanceof FirebaseError) {
        throw err;
      }
      throw new Error("Failed to log out");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signUpWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
