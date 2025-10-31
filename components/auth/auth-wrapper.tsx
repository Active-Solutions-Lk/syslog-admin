import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <>{children}</>;
}