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
      onClick: () => setShowAppSettings(true),
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
      <div className="w-16 h-full bg-card rounded-l-lg shadow-card flex flex-col items-center py-4">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="h-5 w-5 text-accent" />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center space-y-2">
          {navItems.map((item, index) => (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={item.onClick}
                  className={`
                    h-10 w-10 rounded-lg p-0
                    ${item.className?.includes('text-red-500') 
                      ? 'text-red-500 hover:bg-red-500/10' 
                      : 'text-foreground-secondary hover:text-accent hover:bg-accent/10'
                    } 
                    ${item.className || ''}
                    ${index === navItems.length - 2 ? 'mt-auto' : ''}
                  `}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right"
                className="bg-card text-foreground shadow-card"
              >
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <ProfileSettings 
        open={showSettings} 
        onOpenChange={setShowSettings}
      />
      <AppSettings
        open={showAppSettings}
        onOpenChange={setShowAppSettings}
      />
      <Dialog open={showTeams} onOpenChange={setShowTeams}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <TeamList />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
