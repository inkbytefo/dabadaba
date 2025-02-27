import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from './AuthProvider';
import { updateUsername, isUsernameAvailable, getUserProfile } from '@/services/firestore/users';
import type { User } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CameraIcon, Cross2Icon } from '@radix-ui/react-icons';

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettings({ open, onOpenChange }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          setCurrentUserProfile(profile);
        }
      });
    }
  }, [user]);

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isAvailable = await isUsernameAvailable(username);
      if (!isAvailable) {
        setError('This username is already taken');
        return;
      }

      await updateUsername(user.uid, username);
      const updatedProfile = await getUserProfile(user.uid);
      if (updatedProfile) {
        setCurrentUserProfile(updatedProfile);
      }
      toast({
        title: 'Username updated',
        description: 'Your username has been successfully updated.',
      });
      setUsername(''); // Clear input after successful update
    } catch (error) {
      setError('An error occurred while updating username');
      console.error('Username update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1e1e]/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-xl sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white/90 tracking-wide">Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-6 px-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 ring-2 ring-white/10 transition-all duration-200 
                             group-hover:ring-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <AvatarImage src={user.photoURL || ''} alt="Profile picture" />
              <AvatarFallback className="bg-messenger-primary/10 text-messenger-primary">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 
                       text-white/70 hover:text-white transition-all duration-200"
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              Change Picture
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                className="bg-white/5 border-white/10 text-white/90 
                         focus:ring-2 focus:ring-white/20 transition-all duration-200"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="bg-white/5 border-white/10 text-white/90 
                         focus:ring-2 focus:ring-white/20 transition-all duration-200"
                disabled
              />
              <Button
                variant="ghost"
                className="px-0 text-white/60 hover:text-white hover:bg-transparent transition-colors duration-200"
              >
                Change password
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-white/60">Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>

            <form onSubmit={handleUsernameUpdate} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/60">Change Username</Label>
                <div className="text-sm text-white/50">
                  Current username: {currentUserProfile?.username || 'Not set'}
                </div>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="bg-white/5 border-white/10 text-white/90 rounded-md 
                           focus:ring-2 focus:ring-white/20 transition-all duration-200
                           hover:bg-white/8"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-red-400 mt-2 bg-red-500/10 p-2 rounded 
                             border border-red-500/20">{error}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 
                         border border-blue-500/20 shadow-md hover:shadow-lg 
                         transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Update Username' : 'Update Username'}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
