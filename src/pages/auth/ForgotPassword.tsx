import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import { Card } from "@/components/ui/card";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    console.log("handleResetPassword called");
    e.preventDefault();
    console.log("Email:", email); // Added console.log for email
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    console.log("Before sendPasswordResetEmail"); // Added console.log before sendPasswordResetEmail

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("After sendPasswordResetEmail"); // Added console.log after sendPasswordResetEmail
      toast.success("Password reset email sent. Please check your inbox.");
      navigate("/auth");
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            toast.error("Please enter a valid email address");
            break;
          case 'auth/user-not-found':
            toast.error("No account found with this email address");
            break;
          default:
            toast.error("Failed to send reset email. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Password reset error:", error);
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
          <h2 className="text-2xl font-semibold text-center text-foreground">Reset Password</h2>
        </div>

        <form onSubmit={handleResetPassword} className="mt-6 space-y-6">
          <div className="space-y-2">
            <p className="text-messenger-secondary text-sm text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="chat-input h-12 text-base"
              required
            />
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full rounded-lg bg-messenger-primary hover:bg-messenger-primary/90 text-white font-semibold h-12"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-lg border border-border hover:bg-messenger-primary/10 text-messenger-secondary hover:text-messenger-primary font-semibold h-12"
              onClick={() => navigate("/auth")}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;