import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { isUsernameAvailable, updateUsername } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onComplete: (username: string) => void;
}

export function UsernameDialog({ isOpen, onClose, userId, onComplete }: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("UsernameDialog - handleSubmit: username=", username, "userId=", userId);
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("UsernameDialog - handleSubmit: checking username availability...");
      const isAvailable = await isUsernameAvailable(username);
      console.log("UsernameDialog - handleSubmit: isUsernameAvailable=", isAvailable);
      if (!isAvailable) {
        setError("This username is already taken");
        return;
      }

      console.log("UsernameDialog - handleSubmit: updating username...");
      await updateUsername(userId, username);
      console.log("UsernameDialog - handleSubmit: updateUsername success");
      toast({
        title: "Username updated",
        description: "Your username has been successfully updated.",
      });
      onComplete(username);
      onClose();
    } catch (error: unknown) {
      console.error("UsernameDialog - handleSubmit error:", error);
      setError("An error occurred while updating username");
      
      if (error instanceof FirebaseError) {
        console.error("Firebase error:", error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.error("Username update error:", error);
        toast({
          title: "Error",
          description: "Failed to update username. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Choose your username</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full rounded-full">
            {isLoading ? "Saving..." : "Save Username"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
