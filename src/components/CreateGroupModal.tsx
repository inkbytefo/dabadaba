import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createGroup } from "@/services/firebase";

const CreateGroupModal = () => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleCreateGroup = async () => {
    setError(null);
    setSuccess(false);

    if (!groupName) {
      setError("Group name is required.");
      return;
    }

    try {
      await createGroup(groupName, groupDescription);
      setSuccess(true);
      setGroupName('');
      setGroupDescription('');
      setTimeout(() => setOpen(false), 1500); // Close modal after 1.5s
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create group.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200">
          <UserPlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1e1e1e]/95 backdrop-blur-lg border-white/10 text-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-white/90 tracking-wide">Create New Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white/70">
              Group Name
            </Label>
            <Input 
              id="name" 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)} 
              className="col-span-3 bg-white/5 border-white/10 text-white/90 placeholder:text-white/40
                       focus:ring-2 focus:ring-white/20 transition-all duration-200
                       hover:bg-white/8" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-white/70">
              Description
            </Label>
            <Input 
              id="description" 
              value={groupDescription} 
              onChange={(e) => setGroupDescription(e.target.value)} 
              className="col-span-3 bg-white/5 border-white/10 text-white/90 placeholder:text-white/40
                       focus:ring-2 focus:ring-white/20 transition-all duration-200
                       hover:bg-white/8" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleCreateGroup} 
            disabled={!groupName}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </Button>
        </DialogFooter>
        {error && (
          <p className="text-red-400 mt-2 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 mt-2 text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
            Group created successfully!
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
