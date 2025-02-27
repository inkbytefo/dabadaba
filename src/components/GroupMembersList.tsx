import React, { useState, useEffect, useMemo } from 'react';
import { Users2, CrossIcon, Shield, CircleDot, MoreVertical } from "lucide-react";
import { subscribeToGroupMembers, subscribeToFriendsList, auth } from "@/services/firebase";
import { User, UserRole } from "@/types/models";
import { UserCard } from "./UserCard";
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

interface GroupMembersListProps {
  groupId: string | null;
  currentUserRole?: UserRole;
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({ groupId, currentUserRole }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");

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
    if (!groupId) {
      setMembers([]);
      return;
    }

    const unsubscribe = subscribeToGroupMembers(groupId, (groupMembers) => {
      setMembers(groupMembers);
    });

    return () => unsubscribe();
  }, [groupId]);

  const isFriend = (userId: string) => {
    return friends.some(friend => friend.id === userId);
  };

  const getRoleBadge = (role?: UserRole) => {
    if (!role) return null;
    
    const badges = {
      owner: <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-500">Owner</Badge>,
      admin: <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-500">Admin</Badge>,
      member: null
    };
    return badges[role];
  };

  const getStatusIndicator = (status?: string) => {
    const colors = {
      online: "bg-green-500",
      away: "bg-yellow-500",
      offline: "bg-gray-500"
    };
    
    return status ? (
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${colors[status as keyof typeof colors]}`} />
    ) : null;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]/80 backdrop-blur-lg rounded-l-lg border-l border-white/10">
      <div className="border-b border-white/10 p-4 backdrop-blur-sm">
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="w-full bg-black/20">
            <TabsTrigger value="all" className="flex-1">
              All ({members.length})
            </TabsTrigger>
            <TabsTrigger value="online" className="flex-1">
              Online ({members.filter(m => m.status === "online").length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex-1">
              Admins ({members.filter(m => m.role === "admin" || m.role === "owner").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <Popover key={member.id}>
              <PopoverTrigger asChild>
                 <div className="py-2 px-2 rounded-md transition-all duration-200 hover:bg-white/5 cursor-pointer relative group">
                    {getStatusIndicator(member.status)}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <UserCard
                          user={member}
                          isFriend={isFriend(member.id)}
                          isPending={false}
                          onClick={() => {}}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(member.role)}
                        {canManageMembers && member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {member.role !== 'admin' && (
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Make Admin 
                                </DropdownMenuItem>
                              )}
                              {member.role === 'admin' && (
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-500">
                                Remove from Group
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                 </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 h-auto bg-[#1e1e1e]/95 rounded-lg border border-white/10 p-3 shadow-xl backdrop-blur-lg focus:outline-none">
                   <PopoverCloseButton className="absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-opacity-50">
                      <CrossIcon className="h-4 w-4 text-white/80" />
                    </PopoverCloseButton>
                    <div className="flex flex-col gap-2">
                        <Button variant={"ghost"} size={"sm"} className="w-full justify-start rounded-md hover:bg-white/5 text-white/90">
                            Message
                        </Button>
                        {!isFriend(member.id) && member.id !== auth.currentUser?.uid && (
                          <Button variant={"ghost"} size={"sm"} className="w-full justify-start rounded-md hover:bg-white/5 text-white/90">
                              Add Friend
                          </Button>
                        )}
                        <Button variant={"ghost"} size={"sm"} className="w-full justify-start rounded-md hover:bg-white/5 text-red-400">
                            Block User
                        </Button>
                    </div>
              </PopoverContent>
            </Popover>
          ))
        ) : (
          <div className="flex items-center justify-center text-white/50 p-6 text-center flex-1">
            No {selectedTab === "online" ? "online " : selectedTab === "admins" ? "admin " : ""}members found
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMembersList;
