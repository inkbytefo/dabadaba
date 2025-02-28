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
import { initializeMessaging, useMessagingStore } from "@/store/messaging";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const RequireAuth = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/20" />
          <p className="text-white/70">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const loading = authLoading || messagingLoading;

  useEffect(() => {
    let mounted = true;
    let cleanupMessaging: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      // Cleanup previous messaging subscription
      if (cleanupMessaging) {
        cleanupMessaging();
        cleanupMessaging = null;
      }

      setUser(user);
      
      if (user) {
        setMessagingLoading(true);
        try {
          cleanupMessaging = await initializeMessaging(user.uid);
        } catch (error) {
          toast.error("Failed to initialize messaging");
          console.error("[AuthProvider] Messaging initialization error:", error);
        } finally {
          if (mounted) {
            setMessagingLoading(false);
          }
        }
      }

      if (mounted) {
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribeAuth();
      if (cleanupMessaging) {
        cleanupMessaging();
      }
    };
  }, []);

  const handleAuthError = (error: FirebaseError) => {
    const errorMessage = error.code === 'auth/wrong-password' 
      ? 'Invalid email or password'
      : error.message;
    toast.error(errorMessage);
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        handleAuthError(error);
      }
      throw error;
    }
  };

  const signUpWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserProfile(result.user);
      }
      return result.user;
    } catch (error) {
      if (error instanceof FirebaseError) {
        handleAuthError(error);
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await createUserProfile(result.user, { displayName: username });
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        handleAuthError(error);
      }
      throw error;
    }
  };

  const logout = async () => {
    if (user) {
      try {
        await signOut(auth);
        useMessagingStore.getState().reset();
      } catch (error) {
        toast.error("Failed to sign out");
        throw error;
      }
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUpWithGoogle,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
