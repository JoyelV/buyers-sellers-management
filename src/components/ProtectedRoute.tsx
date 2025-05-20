'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { ClipLoader } from 'react-spinners';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth: boolean; // True for protected routes, false for auth pages (e.g., login/signup)
  redirectTo: string; // Where to redirect if the condition fails
}

export default function ProtectedRoute({ children, requireAuth, redirectTo }: ProtectedRouteProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Check if token exists in localStorage to determine initial auth state
    const storedToken = localStorage.getItem('token');

    // If there's no token and user is null, we're not authenticated
    if (!storedToken && !user) {
      setIsLoading(false);
      if (requireAuth) {
        router.push(redirectTo); // Redirect unauthenticated users from protected routes
      }
      return;
    }

    // If user data is loaded (or failed to load), stop loading
    if (user !== undefined) {
      setIsLoading(false);
      if (requireAuth && !user) {
        router.push(redirectTo); // Redirect unauthenticated users from protected routes
      } else if (!requireAuth && user) {
        router.push(redirectTo); // Redirect authenticated users from auth pages
      }
    }
  }, [user, token, router, requireAuth, redirectTo]);

  // Show a loading state while checking auth status
  if (isLoading) {
      return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <ClipLoader color="#3498db" size={50} />
    </div>
  );
  }

  // If the user is not authenticated and the route requires auth, don't render children
  if (requireAuth && !user) return null;

  // If the user is authenticated and the route doesn't require auth, don't render children
  if (!requireAuth && user) return null;

  return <>{children}</>;
}