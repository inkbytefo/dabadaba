import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navigate, useLocation } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
