import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminManagement } from '@/components/dashboard/admin-management';

export default async function AdminPage() {
  // Check if user is authenticated
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <AdminManagement />;
}