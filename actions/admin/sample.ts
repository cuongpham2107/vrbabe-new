'use server'

import db from "@/lib/admin/db";
import { checkPermissions } from "@/lib/admin/fields";
import { FC } from "react";
import { createHistoryAdmin, getAdmin } from "./admin";
import { hash } from "bcrypt";
import { TABLES_SAMPLE } from "@/app/admin/(admin)/[slug]/table";

export type SampleColumnsType = {
  name: string,
  label?: string | null,
  show: boolean,
  required?: boolean | null,
  col?: number | null
} & SampleFieldAndDetailsType

export type SampleFieldAndDetailsType = (
  SampleColumnSelectType | 
  SampleColumnReactionType |
  SampleColumnFileType |
  SampleColumnSlugType |
  SampleColumnCustomType | 
  // SampleColumnPermissionsType |
  {
    type: 'string' | 'date' | 'publish' | 'int' | 'bool' | 'text' | 'permissions' | 'password',
    details?: undefined
  }
)

export type SampleColumnSelectType = {
  type: 'select',
  details: {
    list: { title: string, value: string}[]
    multiple?: boolean,
  }
}

export type FileTypeState = ('all' | 'image' | 'audio' | 'video')[]

export type SampleColumnFileType = {
  type: 'file',
  details: {
    multiple?: boolean,
    onlyTable?: boolean,
    myself?: boolean,
    fileTypes?: FileTypeState
  }
}

export type SampleColumnReactionType = {
  type: 'relation',
  details: {
    typeRelation: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many',
    tableNameRelation: string,
    titleRelation: string
  }
}

export type SampleColumnSlugType = {
  type: 'slug',
  details: {
    tableNameSlug: string,
  }
}

export type SampleColumnCustomType = {
  type: 'custom',
  details: {
    customComponentEdit: FC<any>,
    customComponentView?: FC<any>,
    customDataCreate?: (name: string, data: any, editId?: number | string) => Promise<any>,
    customDataSelect?: (name: string) => object,
    formatDataSelect?: (data: any) => void,
    defaultValue?: any
  }
}

// export type SampleColumnPermissionsType = {
//   type: 'permissions',
//   details?: undefined
// }

export type GetDataSampleState = {
  page: number, 
  per_page: number,
  orderBy?: string,
  orderType?: 'asc' | 'desc'
}

export const getDataSample = async ({
  page, per_page, tableName,
  orderBy, orderType
}: GetDataSampleState & { tableName: string }) => {
  // const user = await useCurrentUserAdmin()
  // if (!user) throw "Authorization"

  // if (!checkPermissions(user.role.permissions, tableName, "browse")) throw "Forbidden"

  const columns = TABLES_SAMPLE.find(v => v.tableName == tableName)?.columns || []

  if (page < 1) page = 1

  const start = (page - 1) * per_page

  try {
    const orderString = (orderBy && orderType && columns.findIndex(v => v.name == orderBy) >= 0) ? {
      [orderBy]: orderType
    } : undefined

    const [data, count] = await db.$transaction([
      (db as any)[tableName].findMany({
        take: per_page,
        skip: start,
        select: columns.reduce((pre, cur) => {
          if (cur.type != "password") {
            return {...pre, [cur.name]: true}
          }
          else {
            return pre
          }
        }, {}),
        orderBy: orderString
      }),
      (db as any)[tableName].count(),
    ])
  
    if (!data) {
      throw ""
    }
  
    return { data, count }
  } catch (error) {
    console.log({error})
    return { data: [], count: 0 }
  }
}

export type GetItemDataSampleState = {
  id: string,
}

export const getItemDataSample = async ({
  id,
  tableName
}: GetItemDataSampleState & { tableName: string }) => {
  // const user = await useCurrentUserAdmin()
  // if (!user) throw "Authorization"

  // if (!checkPermissions(user.role.permissions, tableName, "browse")) throw "Forbidden"

  const columns = TABLES_SAMPLE.find(v => v.tableName == tableName)?.columns || []

  const data = await (db as any)[tableName].findUnique({
    where: {
      id: columns.find(v => v.name == "id")?.type == "int" ? (+id || 0) : id,
    },
    select: columns.reduce((pre, cur) => {
      if (cur.type == "custom" && cur.details.customDataSelect) {
        return {
          ...pre,
          ...cur.details.customDataSelect(cur.name)
        }
      }
      else if (cur.type != "password") {
        return {...pre, [cur.name]: true}
      }
      else {
        return pre
      }
    }, {})
  })

  let dataFormat: any = data 

  for (const property in data) {
    let column = columns.find(v => v.name == property)
    if (column && column?.type == "custom" && column.details.formatDataSelect) {
      dataFormat[property] = column.details.formatDataSelect(dataFormat[property])
    }
  }

  return dataFormat
}

export type DeleteDataSampleState = {
  ids: any[],
}

export const deleteDataSample = async ({
  ids,
  tableName
}: DeleteDataSampleState & { tableName: string }) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  if (!checkPermissions(user.role.permissions, tableName, "delete")) throw "Forbidden"

  await (db as any)[tableName].deleteMany({
    where: {
      id: {
        in: ids
      }
    },
  })

  await createHistoryAdmin({
    action: 'Xóa',
    title: 'Xóa dữ liệu bảng ' + tableName,
    adminId: user.id,
    status: 'success',
    tableName: tableName,
  })
}

export type AddEditDataSampleState = {
  data: any,
  edit: boolean
}

export const addEditDataSample = async ({
  data, edit = false, tableName
}: AddEditDataSampleState & { tableName: string }) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (!(edit ? checkPermissions(user.role.permissions, tableName, "edit") 
      : checkPermissions(user.role.permissions, tableName, "create"))) {
      throw "Forbidden";
    }

    const columns = TABLES_SAMPLE.find(v => v.tableName == tableName)?.columns || []

    const intermediateResults = await Promise.all(columns.filter(v => !['id', 'createdAt', 'updatedAt', 'publish']
      .includes(v.name)).map(async (pre) => {
        if (pre.type == "date") {
          return { [pre.name]: new Date(data[pre.name]) }
        }
        else if (pre.type == "int") {
          return { [pre.name]: +(data[pre.name]) }
        }
        else if (pre.type == "password") {
          return { [pre.name]: await hash(data[pre.name], 10) }
        }
        else if (pre.type == "file") {
          if (data[pre.name]) {
            let tempConnect = { id: data[pre.name]['id'] }
            if (pre.details.multiple) {
              tempConnect = data[pre.name].map((v: any) => ({
                id: v['id']
              }))
            }
            return { [pre.name]: { connect: tempConnect } }
          }
          else
            return { [pre.name]: undefined }
        }
        else if (pre.type == "relation") {
          if (data[pre.name]) {
            let tempConnect = { id: data[pre.name]['id'] }
            if (pre.details.typeRelation == 'one-to-many' || pre.details.typeRelation == 'many-to-many') {
              tempConnect = data[pre.name].map((v: any) => ({
                id: v['id']
              }))
            }
            return { [pre.name]: { connect: tempConnect } }
          }
          else
            return { [pre.name]: undefined }
        }
        else if (pre.type == "permissions") {
          if (data[pre.name]) {
            let tempCreate = {}

            if (!edit) {
              tempCreate = {
                create: data[pre.name].map((v: any) =>
                  ({
                    permission: {
                      connectOrCreate: {
                        where: {
                          key_tableName: {
                            key: v.permissionKey,
                            tableName: v.permissionTableName
                          }
                        },
                        create: {
                          key: v.permissionKey,
                          tableName: v.permissionTableName
                        }
                      }
                    }
                  })
                )
              }
            }
            else {

              await db.$transaction(data[pre.name].map((v: any) => db.permission.upsert({
                where: {
                  key_tableName: {
                    key: v.permissionKey,
                    tableName: v.permissionTableName
                  }
                },
                create: {
                  key: v.permissionKey,
                  tableName: v.permissionTableName
                },
                update: {}
              })))

              await db.permissionsOnRoles.deleteMany({
                where: {
                  roleId: data.id
                }
              })

              tempCreate = {
                create: data[pre.name].map((v: any) =>
                  ({
                    permissionKey: v.permissionKey,
                    permissionTableName: v.permissionTableName
                  })
                )
              }
            }

            return { [pre.name]: tempCreate }
          }
          else
            return { [pre.name]: undefined }
        }
        else if (pre.type == "custom" && pre.details.customDataCreate) {
          return await pre.details.customDataCreate(pre.name, data[pre.name], data.id)
        }
        else {
          return { [pre.name]: data[pre.name] }
        }
      }, 
      {}
    ))

    const dataCreate = intermediateResults.reduce((cur, result) => ({ ...cur, ...result }), {});

    if (edit) {
      await (db as any)[tableName].update({
        where: {
          id: data.id
        },
        data: dataCreate
      })

      await createHistoryAdmin({
        action: 'Cập nhập',
        title: 'chỉnh sửa dữ liệu bảng ' + tableName,
        adminId: user.id,
        status: 'success',
        tableName: tableName,
        data: JSON.stringify(dataCreate, null, 2)
      })
    }
    else {
      await (db as any)[tableName].create({
        data: dataCreate
      })

      await createHistoryAdmin({
        action: 'Tạo mới',
        title: 'Thêm bản ghi mới bảng ' + tableName,
        adminId: user.id,
        status: 'success',
        tableName: tableName,
        data: JSON.stringify(dataCreate, null, 2)
      })
    }
  }
  catch (error) {
    console.log({error})

    await createHistoryAdmin({
      action: edit ? 'Cập nhập' : 'Tạo mới',
      title: edit ? 'chỉnh sửa dữ liệu bảng ' + tableName : 'Thêm bản ghi mới bảng ' + tableName,
      adminId: user.id,
      status: 'error',
      tableName: tableName
    }).catch(e => {})

    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const getListDataOfRelation = async ({
  tableName
}: { tableName: string }) => {
  try {
    const user = await getAdmin()
    if (!user) throw "Unauthorized"
    if (!checkPermissions(user.role.permissions, tableName, "browse")) throw "Forbidden"

    const data = await (db as any)[tableName].findMany()

    return {data}
  }
  catch (error) {
    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const changePublishData = async ({
  id, tableName, publish
}: { id: string, tableName: string, publish?: 'publish' | 'draft' }) => {
  const user = await getAdmin()
  if (!user) throw "Unauthorized"
  try {

    if (!checkPermissions(user.role.permissions, tableName, "edit")) throw "Forbidden"

    const data = await (db as any)[tableName].update({
      where: {
        id: id
      },
      data: {
        publish
      }
    })

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Thay đổi trang thái xuất bản bảng ' + tableName + ' sang ' + (publish == "publish" ? 'Xuất bản' : 'Nháp'),
      adminId: user.id,
      status: 'success',
      tableName: tableName,
      data: JSON.stringify({publish}, null, 2)
    })

    return {data}
  }
  catch (error) {
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Thay đổi trang thái xuất bản bảng ' + tableName + ' sang ' + (publish == "publish" ? 'Xuất bản' : 'Nháp'),
      adminId: user.id,
      status: 'error',
      tableName: tableName,
      data: JSON.stringify({publish}, null, 2)
    }).catch(e => {})

    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}