import './globals.css';
import AuthProvider from '@/components/auth-provider';
import QueryProvider from '@/components/providers/QueryProvider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'NurseConnect v2',
  description: 'Modern scheduling for healthcare professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}