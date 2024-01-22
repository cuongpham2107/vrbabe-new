import { getAdmin } from '@/actions/admin/admin'
import LoginContentAdmin from '@/components/admin/content/LoginContentAdmin'
import { redirect } from 'next/navigation'

const page = async ({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined },
}) => {
  const data = await getAdmin()

  if (data) {
    const url = searchParams?.url || '/admin'
    redirect(url)
  }

  return <LoginContentAdmin />
}

export default page