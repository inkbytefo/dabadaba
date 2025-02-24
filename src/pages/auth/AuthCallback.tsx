import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = () => {
      const redirectPath = sessionStorage.getItem('authRedirectPath') || '/';
      sessionStorage.removeItem('authRedirectPath');
      navigate(redirectPath);
    };

    if (user) {
      handleAuthCallback();
    } else {
      navigate('/auth');
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-messenger-primary"></div>
    </div>
  );
};

export default AuthCallback;
