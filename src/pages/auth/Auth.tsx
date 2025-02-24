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
  const { signIn, signInWithGoogle } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      navigate("/");
    } catch (error) {
      if (error instanceof FirebaseError || error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      if (error instanceof FirebaseError || error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center">
            <Gamepad className="h-12 w-12 text-messenger-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold">Welcome</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in or create an account to start messaging
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full bg-white/10 hover:bg-white/20 text-white"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-messenger-primary hover:bg-messenger-secondary"
              >
                Sign In
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => navigate("/register")}
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { Auth };
