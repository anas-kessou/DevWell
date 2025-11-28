import { Navigate } from 'react-router-dom';
import { useProfile } from '../hooks';
import { tokenManager } from '../services';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication
 * - Checks for token presence
 * - Fetches user profile
 * - Shows loading state while checking auth
 * - Redirects to login if not authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: user, isLoading, error } = useProfile();

  // Check if token exists
  const hasToken = tokenManager.isAuthenticated();

  // If no token, redirect to login immediately
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If profile fetch failed or user not found, redirect to login
  if (error || !user) {
    // Clear invalid token
    tokenManager.removeToken();
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};
