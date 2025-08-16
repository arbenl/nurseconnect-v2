import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome, {session?.user?.name || session?.user?.email}!</p>
      <p>Your assigned role is: <strong>{session?.user?.role}</strong></p>
      <div className="mt-6 p-4 bg-gray-50 rounded-md overflow-x-auto">
        <h3 className="font-semibold">Session Details:</h3>
        <pre className="text-sm">{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
