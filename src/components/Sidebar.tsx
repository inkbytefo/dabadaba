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

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = [
    { icon: User, label: 'Profile', onClick: () => navigate('/settings') },
    { icon: Users, label: 'Teams', onClick: () => navigate('/') },
    { icon: MessageSquare, label: 'Chat', onClick: () => navigate('/') },
    { icon: Bell, label: 'Notifications', onClick: () => {} },
    { icon: Phone, label: 'Calls', onClick: () => {} },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: () => navigate('/settings'),
      className: 'mt-auto'
    },
    { 
      icon: LogOut, 
      label: 'Sign Out', 
      onClick: async () => {
        await logout();
        navigate('/auth');
      },
      className: 'text-red-500 hover:bg-red-500/20'
    }
  ];

  return (
    <div className="w-16 h-screen bg-accent/5 flex flex-col items-center py-4 border-r border-border/40">
      {navItems.map((item, index) => (
        <Tooltip key={item.label} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              onClick={item.onClick}
              className={`h-10 w-10 rounded-md p-0 text-muted-foreground hover:text-foreground hover:bg-accent/20 mb-2 ${item.className || ''}`}
              variant={item.className?.includes('text-red-500') ? 'destructive' : 'ghost'}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
