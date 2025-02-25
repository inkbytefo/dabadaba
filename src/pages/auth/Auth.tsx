import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signIn, signUpWithGoogle } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      console.error("Email sign-in error:", err);
      if (err instanceof FirebaseError) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signUpWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err instanceof FirebaseError) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred during Google sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-lg">
        <div className="flex flex-col items-center gap-8">
          <Gamepad className="h-12 w-12" />
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
        </div>

        <form onSubmit={handleEmailSignIn} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in with Email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
