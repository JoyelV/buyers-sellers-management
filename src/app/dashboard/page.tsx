'use client';

import { useAuth } from '../../lib/authContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
// Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Show a loading state while checking user authentication
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Welcome, {user!.id}!</p>
        <p>Role: {user!.role}</p>
        <p>Email: {user!.email}</p>
      </div>
    </ProtectedRoute>
  );
}