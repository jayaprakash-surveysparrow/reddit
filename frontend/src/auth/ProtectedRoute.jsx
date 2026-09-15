import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { Spinner } from '../components/ui/Spinner';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner label="Checking your session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
