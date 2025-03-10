import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { isUsernameAvailable } from "@/services/firestore/users";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import { Card } from "@/components/ui/card";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (value.length > 20) {
      return "Username must be less than 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  };
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usernameError = validateUsername(username);
      if (usernameError) {
        toast.error(usernameError);
        return;
      }

      setLoading(true);
      const isAvailable = await isUsernameAvailable(username);
      if (!isAvailable) {
        toast.error("This username is already taken");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      await signUp(email, password, username);
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
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4">
      <Card className="w-full max-w-md space-y-6 glass-panel border-border/50 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-messenger-primary rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h2 className="text-2xl font-semibold text-center text-foreground">Create Account</h2>
        </div>

        <form onSubmit={handleEmailSignUp} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="chat-input h-12 text-base"
              />
              <p className="mt-2 text-sm text-messenger-secondary">
                Choose a unique username (3-20 characters, letters, numbers, and underscores only)
              </p>
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="chat-input h-12 text-base"
            />
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="chat-input h-12 text-base"
              />
              <p className="mt-2 text-sm text-messenger-secondary">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full rounded-lg bg-messenger-primary hover:bg-messenger-primary/90 text-white font-semibold h-12" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <Button
              type="button"
              className="w-full rounded-lg border border-border bg-background-secondary text-foreground hover:bg-messenger-primary/10 font-semibold h-12"
              onClick={() => navigate("/auth")}
              disabled={loading}
            >
              Back to Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export { Register };
