import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles, isOnboardingPage = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
          <span className="text-xs text-text-muted mt-3 font-semibold tracking-wider">LOADING LEVGRESS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if user profile is incomplete
  if (!user.onboarded && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect away from onboarding if user is already onboarded
  if (user.onboarded && isOnboardingPage) {
    return user.role === 'STAFF' ? (
      <Navigate to="/staff-dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their respective dashboards
    return user.role === 'STAFF' ? (
      <Navigate to="/staff-dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  return children;
};
