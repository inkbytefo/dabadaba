import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signIn, signUpWithGoogle } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
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
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <Card className="w-full max-w-md space-y-6 bg-zinc-900 border-0 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h2 className="text-2xl font-semibold text-center text-white">User Login</h2>
        </div>

        <form onSubmit={handleEmailSignIn} className="mt-6 space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              className="rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-yellow-500 h-12"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              className="rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-yellow-500 h-12"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm text-zinc-400">
            <a href="#" className="hover:underline">Forgot Password?</a>
            <Button
              {...(
                {
                  type: "button",
                  variant: "link",
                  className: "text-yellow-500 hover:text-yellow-400 p-0",
                  onClick: () => navigate("/register"),
                } as ButtonProps
              )}
            >
              Create an account
            </Button>
          </div>

          <div className="space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold h-12" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Email"}
            </Button>
            <Button
              type="button"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 font-semibold h-12"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
