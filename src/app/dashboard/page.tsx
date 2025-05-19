'use client';

import { useAuth } from '../../lib/authContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Welcome, {user!.name}!</p>
        <p>Role: {user!.role}</p>
        <p>Email: {user!.email}</p>
      </div>
    </ProtectedRoute>
  );
}