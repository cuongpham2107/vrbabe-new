import { getAdmin } from '@/actions/admin/admin'
import ProfileContentAdmin from '@/components/admin/content/ProfileContentAdmin'
import db from '@/lib/admin/db'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function page() {
  const data = await getAdmin()

  if (data == null) {
    redirect('/admin/login')
  }

  return <ProfileContentAdmin defaultValue={data} />
}