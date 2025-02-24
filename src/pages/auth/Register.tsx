import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      await signUp(email, password);
      toast.success("Account created successfully! Please sign in.");
      navigate("/auth");
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          toast.error("This email is already registered. Please sign in instead.");
          navigate("/auth");
        } else if (error.code === 'auth/invalid-email') {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error(error.message);
        }
      } else if (error instanceof Error) {
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
          <h2 className="mt-6 text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Fill in your details to create a new account
          </p>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-6">
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
            <p className="mt-2 text-sm text-gray-400">
              Password must be at least 6 characters long
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-messenger-primary hover:bg-messenger-secondary"
            >
              Create Account
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => navigate("/auth")}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Back to Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { Register };
