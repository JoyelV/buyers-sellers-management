import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/authContext';
import NavBar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <NavBar />
          <main className="container mx-auto p-6">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#2d3748', // Dark gray for toasts
                color: '#e2e8f0', // Light gray text
                borderRadius: '8px',
                padding: '12px',
              },
              success: {
                style: {
                  background: '#48bb78', // Green for success
                },
              },
              error: {
                style: {
                  background: '#e53e3e', // Red for errors
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}