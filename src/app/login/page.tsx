'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../lib/authContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!API_URL) {
      setError('API URL is not defined. Please check your environment variables.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      await login(response.data.token);
      toast.success("Login successful!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#059669",
          color: "#fff",
          border: "1px solid #047857",
        }
      });
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || 'Something went wrong');
      toast.error('Failed to login. Please check your credentials.');
    }
  };

  return (
    <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Log In
            </button>
          </form>
          <p className="mt-4 text-center">
            {"Don't have an account? "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}