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
            position="top-right" 
            toastOptions={{
              duration: 5000, 
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px',
              },
              success: {
                style: {
                  background: '#10B981', 
                },
              },
              error: {
                style: {
                  background: '#EF4444', 
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}