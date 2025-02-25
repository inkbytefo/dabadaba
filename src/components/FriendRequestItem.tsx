import React, { useState } from "react";
import { acceptFriendRequest, rejectFriendRequest } from "@/services/firebase";
import type { User } from "@/types/models";
import type { FriendRequest } from "@/types/models";
import { Avatar } from "@/components/ui/avatar";

interface FriendRequestItemProps {
  request: FriendRequest;
  senderProfile: User;
  onUpdate: () => void; // Callback to re-fetch requests in parent component
}

export const FriendRequestItem: React.FC<FriendRequestItemProps> = ({ request, senderProfile, onUpdate }) => {
  const [acceptStatus, setAcceptStatus] = useState<"idle" | "loading" | "error">("idle");
  const [rejectStatus, setRejectStatus] = useState<"idle" | "loading" | "error">("idle");
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const handleAcceptRequest = async () => {
    setAcceptStatus("loading");
    setAcceptError(null);
    try {
      await acceptFriendRequest(request.id);
      setAcceptStatus("idle");
      onUpdate(); // Re-fetch friend requests in parent component
    } catch (error) {
      setAcceptStatus("error");
      setAcceptError("Error accepting request.");
    }
  };

  const handleRejectRequest = async () => {
    setRejectStatus("loading");
    setRejectError(null);
    try {
      await rejectFriendRequest(request.id);
      setRejectStatus("idle");
      onUpdate(); // Re-fetch friend requests in parent component
    } catch (error) {
      setRejectStatus("error");
      setRejectError("Error rejecting request.");
    }
  };

  return (
    <li key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <img
            src={senderProfile?.photoURL || "/placeholder.svg"}
            alt={senderProfile?.displayName}
            className="object-cover"
          />
        </Avatar>
        <div>Friend request from: <span className="font-semibold">{senderProfile?.displayName || request.senderId}</span></div>
      </div>
      <div className="space-x-2">
        <button 
          onClick={handleAcceptRequest} 
          disabled={acceptStatus === "loading" || rejectStatus === "loading"}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          {acceptStatus === "loading" ? "Accepting..." : "Accept"}
        </button>
        <button 
          onClick={handleRejectRequest} 
          disabled={rejectStatus === "loading" || acceptStatus === "loading"}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          {rejectStatus === "loading" ? "Rejecting..." : "Reject"}
        </button>
      </div>
      {acceptStatus === "error" && <p className="text-red-500 text-sm mt-1">{acceptError}</p>}
      {rejectStatus === "error" && <p className="text-red-500 text-sm mt-1">{rejectError}</p>}
    </li>
  );
};