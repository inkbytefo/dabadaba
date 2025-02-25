import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { sendFriendRequest } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FriendRequestButtonProps {
  userId: string;
  className?: string;
}

export const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({ 
  userId, 
  className 
}) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddFriend = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    if (!currentUserId) {
      console.error("Current user ID not found.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      await sendFriendRequest(currentUserId, userId);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to send request");
      console.error("Error sending friend request:", error);
    }
  };

  const buttonVariants = {
    idle: {
      base: "bg-messenger-primary/20 hover:bg-messenger-primary/30 text-messenger-primary",
      icon: <Plus className="h-4 w-4" />,
      text: "Add Friend"
    },
    loading: {
      base: "bg-messenger-primary/20 text-messenger-primary cursor-not-allowed",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: "Sending"
    },
    success: {
      base: "bg-green-500/20 text-green-500 cursor-not-allowed",
      icon: <Check className="h-4 w-4" />,
      text: "Sent"
    },
    error: {
      base: "bg-red-500/20 hover:bg-red-500/30 text-red-500",
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Retry"
    }
  };

  const variant = buttonVariants[status];

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        onClick={handleAddFriend}
        disabled={status === "loading" || status === "success"}
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-md transition-colors",
          variant.base
        )}
      >
        {variant.icon}
        <span className="text-sm font-medium">{variant.text}</span>
      </Button>
      {status === "error" && errorMessage && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded">
            {errorMessage}
          </span>
        </div>
      )}
    </div>
  );
};