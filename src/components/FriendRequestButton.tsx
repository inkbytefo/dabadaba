import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { sendFriendRequest } from "@/services/firebase";

interface FriendRequestButtonProps {
  userId: string;
}

export const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({ userId }) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddFriend = async () => {
    if (!currentUserId) {
      console.error("Current user ID not found.");
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    try {
      await sendFriendRequest(currentUserId, userId);
      setStatus("success");
      console.log("Friend request sent successfully to:", userId);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Error sending friend request. Please try again.");
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddFriend}
        className="p-1 hover:bg-white/5 transition-colors "
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Sending..." : status === "success" ? "Request Sent" : "+"}
      </button>
      {status === "error" && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
    </div>
  );
};