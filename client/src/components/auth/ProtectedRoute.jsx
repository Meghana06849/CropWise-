import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return <div className="p-8 text-sm text-slate-500">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
