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
import { updateUsername, isUsernameAvailable, getUserProfile } from '@/services/firebase';
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
      <DialogContent className="glass-panel border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-2 border-messenger-primary/20">
              <AvatarImage src={user.photoURL || ''} alt="Profile picture" />
              <AvatarFallback className="bg-messenger-primary/10 text-messenger-primary">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border hover:bg-messenger-primary/10 hover:text-messenger-primary"
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              Change Picture
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                className="chat-input"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="chat-input"
                disabled
              />
              <Button
                variant="link"
                className="pl-0 text-messenger-primary hover:text-messenger-primary/80"
              >
                Change password
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-foreground">Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>

            <form onSubmit={handleUsernameUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Change Username</Label>
                <div className="text-sm text-messenger-secondary">
                  Current username: {currentUserProfile?.username || 'Not set'}
                </div>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="chat-input"
                  disabled={isLoading}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-messenger-primary hover:bg-messenger-primary/90 text-white"
              >
                {isLoading ? 'Updating...' : 'Update Username'}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
