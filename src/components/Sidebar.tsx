import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  User,
  Users,
  MessageSquare,
  Bell,
  Phone,
  Settings,
  LogOut
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ProfileSettings } from './ProfileSettings';
import AppSettings from '@/pages/AppSettings';
import { TeamList } from './TeamList';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { 
      icon: User, 
      label: 'Profile', 
      onClick: () => setShowSettings(true),
      className: ''
    },
    { 
      icon: Users, 
      label: 'Teams', 
      onClick: () => setShowTeams(true),
      className: ''
    },
    { 
      icon: MessageSquare, 
      label: 'Chat', 
      onClick: () => navigate('/'),
      className: ''
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      onClick: () => {},
      className: ''
    },
    { 
      icon: Phone, 
      label: 'Calls', 
      onClick: () => {},
      className: ''
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: () => setShowAppSettings(true), // Open AppSettings dialog
      className: 'mt-auto'
    },
    { 
      icon: LogOut, 
      label: 'Sign Out', 
      onClick: handleLogout,
      className: 'text-red-500'
    }
  ];

  return (
    <>
      <div className="w-16 h-screen bg-background flex flex-col items-center py-4 border-r border-border/50">
        {navItems.map((item) => (
          <Tooltip key={item.label} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={item.onClick}
                className={`
                  h-10 w-10 rounded-lg p-0 mb-2
                  ${item.className?.includes('text-red-500') 
                    ? 'text-red-500 hover:bg-red-500/10' 
                    : 'text-messenger-secondary hover:text-messenger-primary hover:bg-messenger-primary/10'
                  } 
                  ${item.className || ''}
                `}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="right"
              className="bg-background-secondary text-foreground border border-border/50"
            >
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <ProfileSettings 
        open={showSettings} 
        onOpenChange={setShowSettings}
      />
      <AppSettings // Render AppSettings as dialog
        open={showAppSettings}
        onOpenChange={setShowAppSettings}
      />
      <Dialog open={showTeams} onOpenChange={setShowTeams}>
        <DialogContent className="max-w-none p-0">
          <TeamList />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
