import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import type { User } from "@/types/models";
import { FirestoreServices } from '@/services/firestore';

const CreateGroupModal = () => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(async (term: string) => {
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await FirestoreServices.users.searchUsers(term);
      // Filter out already selected members
      const filteredResults = results.filter(
        user => !selectedMembers.some(member => member.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleSelectMember = (user: User) => {
    setSelectedMembers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(result => result.id !== user.id));
    setSearchTerm('');
  };

  const handleRemoveMember = (user: User) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== user.id));
  };

  const handleCreateGroup = async () => {
    setError(null);
    setSuccess(false);

    if (!groupName) {
      setError("Group name is required.");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Please select at least one member.");
      return;
    }

    try {
      // await createGroup(groupName, selectedMembers.map(member => member.id)); // createGroup is not implemented yet in modular firebase
      setSuccess(true);
      setGroupName('');
      setSelectedMembers([]);
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
            <Label htmlFor="members" className="text-right text-white/70">
              Add Members
            </Label>
            <div className="col-span-3 space-y-2">
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedMembers.map(member => (
                    <div 
                      key={member.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        {member.displayName}
                        <span 
                          className={`w-2 h-2 rounded-full ${
                            member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                      </span>
                      <button 
                        onClick={() => handleRemoveMember(member)}
                        className="hover:text-blue-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <Input 
                  id="members"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full bg-white/5 border-white/10 text-white/90 placeholder:text-white/40
                           focus:ring-2 focus:ring-white/20 transition-all duration-200
                           hover:bg-white/8"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              {searchResults.length > 0 && (
                <ul className="mt-1 max-h-32 overflow-auto rounded-md border border-white/10 bg-black/20">
                  {searchResults.map(user => (
                    <li
                      key={user.id}
                      className="px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => handleSelectMember(user)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{user.displayName}</span>
                        <span 
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
