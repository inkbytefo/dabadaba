import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ProfileSettings } from './ProfileSettings';
import AppSettings from '@/pages/AppSettings';
import { TeamList } from './TeamList';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface TopNavigationProps {
  onViewChange: (view: 'chat' | 'groups') => void;
  unreadNotifications?: number;
  missedCalls?: number;
}

export const TopNavigation = ({ 
  onViewChange, 
  unreadNotifications = 0, 
  missedCalls = 0 
}: TopNavigationProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');
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

  const handleViewChange = (view: 'chat' | 'groups') => {
    setActiveView(view);
    onViewChange(view);
    if (view === 'chat') {
      navigate('/');
    }
  };

  const navItems = [
    {
      icon: MessageSquare,
      label: 'Chat',
      onClick: () => handleViewChange('chat'),
      isActive: activeView === 'chat',
    },
    {
      icon: Users,
      label: 'Groups',
      onClick: () => handleViewChange('groups'),
      isActive: activeView === 'groups',
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: () => {},
      isActive: false,
    },
    {
      icon: Phone,
      label: 'Calls',
      onClick: () => {},
      isActive: false,
    },
  ];

  return (
    <>
      <div className={`
        fixed top-0 left-0 right-0 h-16 z-header
        bg-[#1e1e1e]/80 border-b border-white/10 
        px-3 md:px-6 flex items-center justify-between 
        backdrop-blur-lg shadow-sm transition-all duration-200`}>
        {/* Left - Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white/90 tracking-wide flex items-center">
            <span className="hidden md:inline">XCORD</span>
            <span className="md:hidden">X</span>
            <span className="text-xs ml-2 text-white/50 font-normal hidden md:inline">application</span>
          </h1>
        </div>

        {/* Center - Navigation */}
        <div className="flex items-center gap-1 md:gap-3">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-2.5 transition-all duration-200 relative
",
                item.isActive 
                  ? "text-white bg-white/15 shadow-inner" 
               : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
              {item.label === 'Notifications' && unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
              {item.label === 'Calls' && missedCalls > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {missedCalls}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Right - User Controls */}
        <div className="flex items-center gap-1 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAppSettings(true)}
            className="text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-white/20 transition-all duration-200"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL} alt={user.displayName || 'Profile'} />
                  <AvatarFallback className="bg-zinc-800 text-white uppercase">
                    {user.displayName?.slice(0, 2) ?? <User className="h-6 w-6 text-white/70" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1e1e1e]/95 backdrop-blur-lg border-white/10 shadow-xl">
              <DropdownMenuItem
                onClick={() => setShowSettings(true)}
                className="text-white/60 hover:text-white focus:text-white hover:bg-white/10 focus:bg-white/15 transition-colors duration-200"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/15 transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <TeamList onGroupSelect={() => {}} />
        </DialogContent>
      </Dialog>
    </>
  );
};
