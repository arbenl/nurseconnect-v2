import './globals.css';
import AuthProvider from '@/components/auth-provider';

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
