'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Bidding System</h1>
      <p className="mb-6">A platform for buyers and sellers to collaborate on projects.</p>
      <div>
        <Link href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4 hover:bg-blue-600">
          Sign Up
        </Link>
        <Link href="/login" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          Log In
        </Link>
      </div>
    </div>
  );
}