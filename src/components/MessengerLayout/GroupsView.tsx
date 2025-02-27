import React, { useState } from 'react';
import { Users2, UserPlus } from "lucide-react";
import { TeamList } from "../TeamList";
import CreateGroupModal from "../CreateGroupModal";

export const GroupsView = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  return (
    <div className="flex w-full h-full">
      {/* Left Panel - Groups List */}
      <div className="w-[320px] bg-[#1e1e1e] border-r border-white/10">
        <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white/90">Groups</h2>
            </div>
            <CreateGroupModal />
          </div>
          <TeamList onGroupSelect={handleGroupSelect} />
          {/* Group Members List moved to TeamList */}
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e] mx-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-black/30">
          <h2 className="text-lg font-semibold text-white/90">
            {selectedGroupId ? "Group Chat" : "Select a group"}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-white/60">
          {selectedGroupId
            ? "Chat will be here"
            : "Choose a group from the list to start chatting"}
        </div>
      </div>
    </div>
  );
};
