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

// Export named functions separately for consistent HMR
// Hooks and Components
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

  console.log("[RequireAuth] State:", { 
    hasUser: !!user, 
    loading, 
    pathname: location.pathname,
    state: location.state 
  });

  if (loading) {
    console.log("[RequireAuth] Still loading, showing loading state");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-white/70">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log("[RequireAuth] No user, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log("[RequireAuth] User authenticated, rendering children");
  return <>{children}</>;
};

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const loading = authLoading || messagingLoading;

  useEffect(() => {
    console.log("[AuthProvider] Initial mount");
    let mounted = true;
    let cleanupMessaging: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      console.log("[AuthProvider] Auth state changed:", {
        userId: user?.uid,
        isAuthenticated: !!user
      });

      // Cleanup previous messaging subscription
      if (cleanupMessaging) {
        console.log("[AuthProvider] Cleaning up previous messaging subscription");
        cleanupMessaging();
        cleanupMessaging = null;
      }

      setUser(user);
      
      if (user) {
        console.log("[AuthProvider] User authenticated, initializing messaging");
        setMessagingLoading(true);
        try {
          // Initialize messaging store and keep cleanup function
          cleanupMessaging = initializeMessaging(user.uid);
        } catch (error) {
          console.error("[AuthProvider] Error initializing messaging:", error);
          if (mounted) {
            toast.error("Error loading messages. Please try again.");
          }
        }
      } else {
        // Reset messaging store on logout
        useMessagingStore.setState({
          conversations: [],
          currentConversation: null,
          currentConversationId: null,
          messages: [],
          status: { isLoading: false, error: null }
        });
      }
      
      // Update loading states only if still mounted
      if (mounted) {
        setAuthLoading(false);
        setMessagingLoading(false);
      }
    });

    // Cleanup function
    return () => {
      console.log("[AuthProvider] Cleanup effect");
      mounted = false;
      unsubscribeAuth();
      if (cleanupMessaging) {
        cleanupMessaging();
      }
      // Reset loading states
      setAuthLoading(false);
      setMessagingLoading(false);
    };
  }, []);

  console.log("[AuthProvider] Render:", { user: !!user, loading });

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
