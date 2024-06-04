import AdminContentSampleCreateEdit from '@/components/admin/sample/AdminContentSampleCreateEdit'
import React from 'react'
import { TABLES_SAMPLE } from '../table'
import { checkPermissions } from '@/lib/admin/fields'
import { getAdmin } from '@/actions/admin/admin'

const page = async ({
  params: { slug }
}: { 
  params: { slug: string } 
}) => {
  const table = TABLES_SAMPLE.find(v => v.slug == slug)
  const tablesName = TABLES_SAMPLE.map(v => v.tableName)

  if (table == undefined)
    return <div>Trang không tồn tại</div>

  const admin = await getAdmin()

  if (!checkPermissions(admin?.role.permissions || [], table.tableName, "create")) {
    return <div>Bạn không có quyền truy cập trang này</div>
  }
  return (
    <AdminContentSampleCreateEdit name={table.name} tableName={table.tableName} columns={table.columns} tablesName={tablesName} />
  )
}

export default page