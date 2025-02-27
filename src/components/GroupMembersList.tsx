import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users2, XCircle, Shield, CircleDot, MoreVertical, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { User, UserRole } from "@/types/models";
import { UserCard } from "./UserCard";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverCloseButton
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { subscribeToGroupMembers, updateMemberRole, removeMember } from '@/services/firestore/groups';
import { subscribeToFriendsList } from '@/services/firestore/friends';

interface GroupMembersListProps {
  groupId: string | null;
  currentUserRole?: UserRole;
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({ groupId, currentUserRole }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const filteredMembers = useMemo(() => {
    switch (selectedTab) {
      case "online":
        return members.filter(member => member.status === "online");
      case "admins":
        return members.filter(member => member.role === "admin" || member.role === "owner");
      default:
        return members;
    }
  }, [members, selectedTab]);

  const canManageMembers = currentUserRole === "admin" || currentUserRole === "owner";

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const unsubFriends = subscribeToFriendsList(currentUser.uid, (friendsList) => {
      setFriends(friendsList);
    });

    return () => unsubFriends();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!groupId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToGroupMembers(groupId, 
      (groupMembers) => {
        setMembers(groupMembers);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  const handleRoleChange = useCallback(async (memberId: string, newRole: UserRole | null) => {
    if (!groupId || !memberId) return;

    try {
      await updateMemberRole(groupId, memberId, newRole);
      toast.success(`Member role ${newRole ? `updated to ${newRole}` : 'removed'}`);
    } catch (error) {
      toast.error("Failed to update member role");
    }
  }, [groupId]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    if (!groupId || !memberId) return;

    try {
      await removeMember(groupId, memberId);
      toast.success("Member removed from group");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  }, [groupId]);

  const isFriend = useCallback((userId: string) => {
    return friends.some(friend => friend.id === userId);
  }, [friends]);

  const getRoleBadge = (role?: UserRole) => {
    if (!role) return null;
    
    const badges = {
      owner: <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-400 font-medium text-xs px-2 py-0.5">Owner</Badge>,
      admin: <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-400 font-medium text-xs px-2 py-0.5">Admin</Badge>,
      member: null
    };
    return badges[role];
  };

  const getStatusIndicator = (status?: string) => {
    const colors = {
      online: "bg-emerald-500 ring-4 ring-emerald-500/20",
      away: "bg-amber-400 ring-4 ring-amber-500/20",
      offline: "bg-gray-500 ring-4 ring-gray-500/20"
    };
    
    return status ? (
      <div 
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
          colors[status as keyof typeof colors]
        )}
        role="status"
        aria-label={`User is ${status}`}
      />
    ) : null;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-white/60">
        <XCircle className="h-12 w-12 mb-4 text-red-400" />
        <p className="text-center">{error}</p>
        <Button 
          variant="ghost" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]/90 backdrop-blur-xl rounded-l-lg border-l border-white/10">
      <div className="border-b border-white/10 p-5 backdrop-blur-sm">
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="w-full bg-black/30 p-1 rounded-lg">
            <TabsTrigger value="all" className="flex-1 font-medium">
              All ({members.length})
            </TabsTrigger>
            <TabsTrigger value="online" className="flex-1 font-medium">
              Online ({members.filter(m => m.status === "online").length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex-1 font-medium">
              Admins ({members.filter(m => m.role === "admin" || m.role === "owner").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div 
        className="flex-1 overflow-y-auto px-4 py-2"
        role="list"
        aria-label={`${selectedTab} members`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-1">
            {filteredMembers.map((member) => (
              <Popover key={member.id}>
                <PopoverTrigger asChild>
                   <div 
                     className={cn(
                       "py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/5 cursor-pointer relative group",
                       "backdrop-blur-sm border border-transparent hover:border-white/5",
                       selectedMemberId === member.id && "bg-white/5 border-white/10"
                     )}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         setSelectedMemberId(member.id);
                       }
                     }}
                     tabIndex={0}
                     role="listitem"
                   >
                      {getStatusIndicator(member.status)}
                      <div className="flex items-center justify-between pl-4">
                        <div className="flex-1">
                          <UserCard
                            user={member}
                            isFriend={isFriend(member.id)}
                            isPending={false}
                            onClick={() => setSelectedMemberId(member.id)}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleBadge(member.role)}
                          {canManageMembers && member.role !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                  aria-label="Member options"
                                >
                                  <MoreVertical className="h-4 w-4 text-white/70" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="min-w-[160px]">
                                {member.role !== 'admin' && (
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => handleRoleChange(member.id, 'admin')}
                                  >
                                    <Shield className="h-4 w-4" />
                                    Make Admin 
                                  </DropdownMenuItem>
                                )}
                                {member.role === 'admin' && (
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => handleRoleChange(member.id, 'member')}
                                  >
                                    <Shield className="h-4 w-4" />
                                    Remove Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-red-400 gap-2"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Remove from Group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                   </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 bg-[#1e1e1e]/95 rounded-lg border border-white/10 p-4 shadow-xl backdrop-blur-xl"
                  align={isMobile ? "center" : "start"}
                >
                  <PopoverCloseButton className="absolute top-3 right-3 rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-opacity-50">
                    <XCircle className="h-4 w-4 text-white/80" />
                  </PopoverCloseButton>
                  <div className="flex flex-col gap-2 pt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start rounded-md hover:bg-white/5 text-white/90 font-medium"
                    >
                      Message
                    </Button>
                    {!isFriend(member.id) && member.id !== auth.currentUser?.uid && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start rounded-md hover:bg-white/5 text-white/90 font-medium"
                      >
                        Add Friend
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start rounded-md hover:bg-white/5 text-red-400 font-medium"
                    >
                      Block User
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-white/40 p-8 text-center flex-1 font-medium">
            No {selectedTab === "online" ? "online " : selectedTab === "admins" ? "admin " : ""}members found
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMembersList;
