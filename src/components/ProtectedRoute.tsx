import { Navigate } from 'react-router-dom';
import { usePinAuth } from '@/hooks/usePinAuth';
import { FullPageLoader } from '@/components/ui/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = usePinAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/pin" replace />;
  }

  return <>{children}</>;
};
