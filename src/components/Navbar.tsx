'use client';

import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { useState } from 'react';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-500 text-white p-4 sm:p-6">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <Link href="/" className="text-lg sm:text-xl font-bold">
            Bidding System
          </Link>
          <button
            className="sm:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        <div
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } sm:flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto`}
        >
          {user ? (
            <>
              <span className="text-sm sm:text-base mr-0 sm:mr-4">
                Welcome, {user.name} ({user.role})
              </span>
              {user.role === 'BUYER' && (
                <Link
                  href="/project/create"
                  className="text-sm sm:text-base hover:underline"
                >
                  Create Project
                </Link>
              )}
              <Link
                href="/project/list"
                className="text-sm sm:text-base hover:underline"
              >
                View Projects
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md hover:bg-red-600 active:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm sm:text-base hover:underline"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm sm:text-base hover:underline"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}