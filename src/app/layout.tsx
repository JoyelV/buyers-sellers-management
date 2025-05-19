import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/authContext';
import NavBar from '../components/Navbar';
import { Toaster } from 'react-hot-toast'; // Import Toaster from react-hot-toast

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          <main className="container mx-auto p-4">{children}</main>
          <Toaster
            position="top-right" // Position of the toast notifications
            toastOptions={{
              duration: 5000, // Duration in milliseconds (5 seconds)
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px',
              },
              success: {
                style: {
                  background: '#10B981', // Green background for success
                },
              },
              error: {
                style: {
                  background: '#EF4444', // Red background for errors
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}