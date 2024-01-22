"use server"
import db from "@/lib/admin/db"
import { parseDataInString } from "@/lib/utils/hepler"
import { GroupSetting, Setting } from "@prisma/client"
import { SampleFieldAndDetailsType } from "./sample"
import { createHistoryAdmin, getAdmin } from "./admin"
import { checkPermissions } from "@/lib/admin/fields"
import { GROUP_SETTINGS } from "@/app/admin/(admin)/[slug]/table"

export type GroupSettingType = Omit<GroupSetting, 'settings'> & {
  settings: SettingType[]
}

export type SettingType = (Omit<Setting, 'type' | 'details' | 'value'>) & SampleFieldAndDetailsType & {
  value: any
}

export const getSettings = async () => {
  const data = await db.groupSetting.findMany({
    include: {
      settings: true
    },
    orderBy: {
      sort: 'asc'
    }
  })

  const groupSettings = await Promise.all(data.map(async v => ({
    ...v,
    settings: await getValueSettings(v.settings)

  })) as any[] as GroupSettingType[])

  const groupSettingsFormat = groupSettings.map(v => ({...v, settings: v.settings.sort((a, b) => (a?.sort || 0) - (b?.sort || 0))}))
 
  return groupSettingsFormat
}

export const createEditSettings = async () => {
  "use server"
  const user = await getAdmin()
  if (!user) throw "Authorization"
  try {
    if (!checkPermissions(user.role.permissions, "setting", "edit")) {
      throw "Forbidden";
    }

    const oldSettings = await db.setting.findMany()

    await db.setting.deleteMany()
    await db.groupSetting.deleteMany()

    await db.$transaction(
      GROUP_SETTINGS.map((v,i) => db.groupSetting.create({
        data: {
          name: v.name,
          label: v.label,
          sort: i + 1,
          settings: {
            create: v.settings.map((v2,i2) => ({
              name: v2.name,
              label: v2.label,
              type: v2.type,
              col: v2.col,
              details: JSON.stringify(v2.details),
              value: oldSettings.find(v3 => v3.name == v2.name)?.value,
              sort: i2 + 1
            }))
          }
        }
      }))
    )

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa các trường dữ liệu cài đặt',
      adminId: user.id,
      status: 'success',
      tableName: 'setting'
    })
  } 
  catch (error) {
    console.log({error})
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa các trường dữ liệu cài đặt',
      adminId: user.id,
      status: 'error',
      tableName: 'setting',
    }).catch(e => {})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  } 
}

export const saveSettings = async(data : {name: string, value: string}[]) => {
  "use server"

  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "setting", "edit")) {
      throw "Forbidden";
    }

    await db.$transaction(data.filter(v => v.value != '').map(({name, value}) => db.setting.update({
      where: {
        name
      },
      data: {
        value: value
      }
    })))

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'chỉnh sửa dữ liệu cài đặt',
      adminId: user.id,
      status: 'success',
      tableName: 'setting'
    })
  } 
  catch (error) {
    console.log({error})
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'chỉnh sửa dữ liệu cài đặt',
      adminId: user.id,
      status: 'error',
      tableName: 'setting'
    }).catch(e => {})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  } 
}

export const getValueSettings = async (settings: Setting[]) => {
  return Promise.all(settings.map(async (v2) => {

    if (v2.type == "file" && v2.value) {
      v2.value = await db.file.findUnique({
        where: {
          id: v2.value
        }
      }) as any
    }

    return {
      ...v2,
      value: parseDataInString(v2.value),
      details: v2.details ? JSON.parse(v2.details) : null
    }
  }))
}

export const getSettingsData = async () => {
  const settings = await db.setting.findMany()

  const data = await getValueSettings(settings)

  return data
}