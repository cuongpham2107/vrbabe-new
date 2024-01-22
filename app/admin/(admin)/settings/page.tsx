import SettingContentAdmin from '@/components/admin/content/SettingContentAdmin'
import db from '@/lib/admin/db'
import { SampleColumnsType, SampleFieldAndDetailsType } from '@/actions/admin/sample'
import { Setting, GroupSetting } from '@prisma/client'
import React from 'react'
import { checkPermissions } from '@/lib/admin/fields'
import { getAdmin } from '@/actions/admin/admin'
import { getSettings } from '@/actions/admin/settings'
import { GROUP_SETTINGS } from '../[slug]/table'

async function page() {
  const admin = await getAdmin()

  if (!checkPermissions(admin?.role.permissions || [], "setting", "browse")) {
    return <div>Bạn không có quyền truy cập trang này</div>
  }

  const groupSettings = await getSettings()

  return (
    <SettingContentAdmin groupSettings={groupSettings}
      GROUPS={GROUP_SETTINGS}
      canCreate={checkPermissions(admin?.role.permissions || [], "setting", "create")}
      canEdit={checkPermissions(admin?.role.permissions || [], "setting", "edit")}
      canDelete={checkPermissions(admin?.role.permissions || [], "setting", "delete")}
    />
  )
}

export default page