import { getAdmin } from '@/actions/admin/admin';
import AdminLayout from '@/components/admin/AdminLayout';
import { redirect } from 'next/navigation';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getAdmin()

  if (user == null) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout userData={user} >
      {children}
    </AdminLayout>
  )
}