import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./AuthProvider";
import { updateUsername, isUsernameAvailable } from "@/services/firebase";
import { useToast } from "@/hooks/use-toast";

export function ProfileSettings() {
  const { user } = useAuth();
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

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isAvailable = await isUsernameAvailable(username);
      if (!isAvailable) {
        setError("This username is already taken");
        return;
      }

      await updateUsername(user.uid, username);
      toast({
        title: "Username updated",
        description: "Your username has been successfully updated.",
      });
      setUsername(""); // Clear input after successful update
    } catch (error) {
      setError("An error occurred while updating username");
      console.error("Username update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUsernameUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Change Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Username"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}