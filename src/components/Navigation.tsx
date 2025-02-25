import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { Home, Settings, LogOut } from 'lucide-react';

export const Navigation = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <>
      <div className="fixed top-4 right-4 flex items-center gap-2">
      <Button
        onClick={() => navigate('/')}
        className="h-10 w-10 rounded-md p-0 text-foreground hover:bg-accent/20"
        title="Home"
      >
        <Home className="h-5 w-5" />
      </Button>
      
      <Button
        onClick={() => navigate('/settings')}
        className="h-10 w-10 rounded-md p-0 text-foreground hover:bg-accent/20"
        title="Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <Button
        onClick={async () => {
          await logout();
          navigate('/auth');
        }}
        className="h-10 w-10 rounded-md p-0 text-foreground hover:bg-red-500/20 hover:text-red-500"
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
      </div>
      <Outlet />
    </>
  );
};
