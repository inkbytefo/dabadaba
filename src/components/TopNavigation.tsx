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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useUIStore } from '@/store/ui';

interface TopNavigationProps {
  unreadNotifications?: number;
  missedCalls?: number;
}

export const TopNavigation = ({ 
  unreadNotifications = 0, 
  missedCalls = 0 
}: TopNavigationProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeView, setActiveView } = useUIStore();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    {
      icon: MessageSquare,
      label: 'Chat',
      onClick: () => {
        setActiveView('chat');
        navigate('/messages');
      },
      isActive: activeView === 'chat' && isActive('/messages'),
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Users,
      label: 'Groups',
      onClick: () => {
        setActiveView('groups');
        navigate('/messages/groups');
      },
      isActive: activeView === 'groups' && isActive('/messages/groups'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: () => navigate('/notifications'),
      isActive: isActive('/notifications'),
      badge: unreadNotifications,
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Phone,
      label: 'Calls',
      onClick: () => navigate('/calls'),
      isActive: isActive('/calls'),
      badge: missedCalls,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const userInitials = user.displayName 
    ? user.displayName.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 right-0 h-16 z-header",
        "bg-[#1e1e1e]/80 backdrop-blur-xl",
        "border-b border-white/[0.02]"
      )}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          {/* Sol - Logo/Brand */}
          <div className="flex items-center gap-8">
            <h1 className={cn(
              "text-xl font-semibold tracking-wide flex items-center",
              "px-3 py-1.5 rounded-lg relative overflow-hidden group"
            )}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="hidden md:inline relative z-10">XCORD</span>
              <span className="md:hidden relative z-10">X</span>
              <span className="text-xs ml-2 text-white/50 font-normal hidden md:inline relative z-10">application</span>
            </h1>

            {/* Ana Navigasyon */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={item.onClick}
                  variant="ghost"
                  className={cn(
                    "relative px-3 py-1.5 rounded-lg transition-all duration-300",
                    "hover:bg-white/5 group",
                    item.isActive && "bg-white/5"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 bg-gradient-to-r",
                    item.color,
                    "group-hover:opacity-10 transition-opacity",
                    item.isActive && "opacity-10"
                  )} />
                  <item.icon className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  {item.badge ? (
                    <span className={cn(
                      "absolute -top-1 -right-1 h-4 w-4 rounded-full",
                      "text-xs flex items-center justify-center text-white z-10",
                      "bg-gradient-to-r",
                      item.color
                    )}>
                      {item.badge}
                    </span>
                  ) : null}
                </Button>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={item.onClick}
                variant="ghost"
                size="icon"
                className={cn(
                  "relative rounded-lg transition-all duration-300",
                  "hover:bg-white/5 group",
                  item.isActive && "bg-white/5"
                )}
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 bg-gradient-to-r",
                  item.color,
                  "group-hover:opacity-10 transition-opacity",
                  item.isActive && "opacity-10"
                )} />
                <item.icon className="h-4 w-4 relative z-10" />
                {item.badge ? (
                  <span className={cn(
                    "absolute -top-1 -right-1 h-4 w-4 rounded-full",
                    "text-xs flex items-center justify-center text-white z-10",
                    "bg-gradient-to-r",
                    item.color
                  )}>
                    {item.badge}
                  </span>
                ) : null}
              </Button>
            ))}
          </nav>

          {/* Sağ - Kullanıcı Kontrolleri */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/settings')}
              variant="ghost"
              size="icon"
              className={cn(
                "relative rounded-lg transition-all duration-300",
                "hover:bg-white/5 group"
              )}
            >
              <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:opacity-100 transition-opacity" />
              <Settings className="h-5 w-5 relative z-10" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative h-8 w-8 rounded-full",
                    "hover:bg-white/5 group"
                  )}
                >
                  <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:opacity-100 transition-opacity rounded-full" />
                  <Avatar className="h-8 w-8">
                    {user.photoURL && (
                      <AvatarImage src={user.photoURL} alt={user.displayName || 'Kullanıcı'} />
                    )}
                    <AvatarFallback>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-1 bg-[#1e1e1e]/95 backdrop-blur-lg border-white/[0.02]">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};
