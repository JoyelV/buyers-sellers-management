'use client';

import Link from 'next/link';
import { useAuth } from '../lib/authContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Bidding System
        </Link>
        <div>
          {user ? (
            <>
              <span className="mr-4">Welcome, {user.name} ({user.role})</span>
              <button
                onClick={logout}
                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4 hover:underline">
                Login
              </Link>
              <Link href="/signup" className="hover:underline">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}