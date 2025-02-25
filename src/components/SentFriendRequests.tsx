import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSentFriendRequests, cancelFriendRequest, getUserProfile } from "@/services/firebase";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const SentFriendRequests = () => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const [receiverProfiles, setReceiverProfiles] = useState({});
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    if (!currentUserId) return;
    const requests = await getSentFriendRequests(currentUserId);
    setSentFriendRequests(requests);
    // Fetch receiver profiles
    const fetchReceiverProfiles = async () => {
      const profiles = await Promise.all(
        requests.map(request => getUserProfile(request.receiverId))
      );
      const profilesMap = profiles.reduce((acc, profile, index) => {
        if (profile) {
          acc[requests[index].receiverId] = profile;
        }
        return acc;
      }, {});
      setReceiverProfiles(profilesMap);
    };
    fetchReceiverProfiles();
  }, [currentUserId, getSentFriendRequests, getUserProfile]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancel = useCallback(async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      fetchRequests(); // Re-fetch requests after canceling
      toast({
        title: "Friend Request Cancelled",
        description: "Friend request cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel friend request. Please try again.",
        variant: "destructive",
      });
    }
  }, [cancelFriendRequest, fetchRequests, toast]);

  return (
    <div className="p-4 flex-col space-y-4 border-r border-white/10">
      <div className="pb-4 border-b border-white/10">
        <h2 className="font-bold text-lg">Sent Friend Requests</h2>
      </div>
      {sentFriendRequests.length === 0 ? (
        <p className="text-gray-400 p-4">No sent friend requests yet.</p>
      ) : (
        <ScrollArea className="flex-1">
          <ul className="space-y-2">
            {sentFriendRequests.map((request) => (
              <li key={request.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <img
                        src={receiverProfiles[request.receiverId]?.photoURL || "/placeholder.svg"}
                        alt={receiverProfiles[request.receiverId]?.displayName}
                        className="object-cover"
                      />
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-gray-500`} // No status for receiver
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-lg font-medium">{receiverProfiles[request.receiverId]?.displayName}</div>
                    <div className="text-sm text-gray-400 flex items-center">
                      Pending
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(request.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  Cancel Request
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
};