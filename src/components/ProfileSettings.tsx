import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from './AuthProvider';
import { updateUsername, isUsernameAvailable, getUserProfile } from '@/services/firebase';
import type { User } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { CameraIcon } from '@radix-ui/react-icons';

export function ProfileSettings() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          setCurrentUserProfile(profile);
        }
      });
    }
  }, [user]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    <div className="flex justify-center w-full bg-red-500">
      <Card className="w-full max-w-md rounded-3xl ">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src="https://github.com/shadcn.png" alt="Profile picture" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <button className="rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-sm">
              <CameraIcon className="mr-2 h-4 w-4" />
              Change Profile Picture
            </button>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                disabled
              />
              <button className="pl-0 p-0 text-sm text-primary underline-offset-4 hover:underline">
                Change password
              </button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>
          </div>
          <form onSubmit={handleUsernameUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Change Username</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Current username: {currentUserProfile?.username || 'Not set'}
              </div>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                disabled={isLoading}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? 'Updating...' : 'Update Username'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
