'use client';

import { useAuth } from '../../lib/authContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>
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