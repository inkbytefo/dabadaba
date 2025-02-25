import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToFriendRequests, acceptFriendRequest, rejectFriendRequest, getUserProfile } from "@/services/firebase";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dot } from "lucide-react";
import { FriendRequestItem } from "./FriendRequestItem";
import { useToast } from "@/components/ui/use-toast";

export const FriendRequests = () => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [friendRequests, setFriendRequests] = useState([]);
  const [senderProfiles, setSenderProfiles] = useState({});
  const { toast } = useToast();

  const fetchRequests = useCallback(() => {
    if (!currentUserId) return () => {};

    const unsubscribe = subscribeToFriendRequests(currentUserId, async (updatedRequests) => {
      setFriendRequests(updatedRequests);
      // Fetch sender profiles for updated requests
      const fetchSenderProfiles = async () => {
        const profiles = await Promise.all(
          updatedRequests.map(request => getUserProfile(request.senderId))
        );
        const profilesMap = profiles.reduce((acc, profile, index) => {
          if (profile) {
            acc[updatedRequests[index].senderId] = profile;
          }
          return acc;
        }, {});
        setSenderProfiles(profilesMap);
      };
      fetchSenderProfiles();
      if (updatedRequests.length > friendRequests.length) {
        toast({
          title: "New Friend Request",
          description: "You have a new friend request!",
        });
      }
    });

    return unsubscribe;
  }, [currentUserId, subscribeToFriendRequests, setFriendRequests, setSenderProfiles, getUserProfile, toast, friendRequests]);

  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = fetchRequests();
    return () => unsubscribe && unsubscribe();
  }, [fetchRequests, currentUserId]);

  const handleAccept = useCallback(async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      fetchRequests(); // Re-fetch requests after accepting
    } catch (error) {
      console.error("Error accepting friend request:", error);
      // TODO: Handle error (e.g., show error message)
    }
  }, [acceptFriendRequest, fetchRequests]);

  const handleReject = useCallback(async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      fetchRequests(); // Re-fetch requests after rejecting
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      // TODO: Handle error (e.g., show error message)
    }
  }, [rejectFriendRequest, fetchRequests]);

  return (
    <div className="p-4 flex-col space-y-4 border-r border-white/10">
      <div className="pb-4 border-b border-white/10">
        <h2 className="font-bold text-lg">Friend Requests</h2>
      </div>
      {friendRequests.length === 0 ? (
        <p className="text-gray-400 p-4">No friend requests yet.</p>
      ) : (
        <ScrollArea className="flex-1">
        <ul className="space-y-2">
          {friendRequests.map((request) => (
            <FriendRequestItem
              key={request.id}
              request={request}
              senderProfile={senderProfiles[request.senderId]}
              onUpdate={fetchRequests}
            />
          ))}
        </ul>
        </ScrollArea>
      )}
    </div>
  );
};