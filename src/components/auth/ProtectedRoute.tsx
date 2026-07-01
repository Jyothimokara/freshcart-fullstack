import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute – wraps any route that requires authentication.
 * If the user is not authenticated, they are redirected to /login
 * and the current location is stored so the user can be sent back
 * after a successful login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to continue', 'info');
    }
  }, [isAuthenticated, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
