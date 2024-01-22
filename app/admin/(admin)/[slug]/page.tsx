import AdminContentSample from "@/components/admin/sample/AdminContentSample";
import { getDataSample } from "@/actions/admin/sample";
import { TABLES_SAMPLE } from "./table";
import { checkPermissions } from "@/lib/admin/fields";
import { getAdmin } from "@/actions/admin/admin";

export default async ({
  searchParams,
  params: { slug }
}: {
  searchParams: { [key: string]: string | undefined },
  params: { slug: string }
}) => {
  const table = TABLES_SAMPLE.find(v => v.slug == slug)

  if (table == undefined)
    return <div>Trang không tồn tại</div>

  const admin = await getAdmin()

  if (!checkPermissions(admin?.role.permissions || [], table.tableName, "browse")) {
    return <div>Bạn không có quyền truy cập trang này</div>
  }

  const page = +(searchParams['page'] || 1)
  const per_page = +(searchParams['per_page'] || table.rowsPerPages[0])
  const orderBy = searchParams['order_by'] || table.orderBy
  const orderType = searchParams['order_type'] || table.orderType
 
  const { data, count } = await getDataSample({
    page, per_page, tableName: table.tableName,
    orderBy,
    orderType: (orderType != "asc" && orderType != "desc") ? undefined : orderType
  })

  return (
    <AdminContentSample 
      name={table.name} 
      table_name={table.tableName}
      data={data} 
      count={count} 
      ROWS_PER_PAGES={table.rowsPerPages} 
      ORDER_BY={table.orderBy}
      ORDER_TYPE={table.orderType}
      columns={table.columns}
      canCreate={checkPermissions(admin?.role.permissions || [], table.tableName, "create")}
      canEdit={checkPermissions(admin?.role.permissions || [], table.tableName, "edit")}
      canDelete={checkPermissions(admin?.role.permissions || [], table.tableName, "delete")}
    />
  )
}