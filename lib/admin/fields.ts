// import { SampleColumnsType, SampleFieldAndDetailsType } from "./sample"

import { PermissionsOnRoles } from "@prisma/client";
import FileInputAdmin from "@/components/admin/form/FileInputAdmin";
import InputAdmin from "@/components/admin/form/InputAdmin";
import SlugInputAdmin from "@/components/admin/form/SlugInputAdmin";
import RichTextAdmin from "@/components/admin/form/RichTextAdmin";
import NumberAdmin from "@/components/admin/form/NumberAdmin";
import SwitchAdmin from "@/components/admin/form/SwitchAdmin";
import DatePickerAdmin from "@/components/admin/form/DatePickerAdmin";
import SelectAdmin from "@/components/admin/form/SelectAdmin";
import RelationInputAdmin from "@/components/admin/form/RelationInputAdmin";
import PermissionsInputAdmin from "@/components/admin/form/PermissionsInputAdmin";
import PasswordInputAdmin from "@/components/admin/form/PasswordInputAdmin";
import { SampleColumnsType, SampleFieldAndDetailsType } from "@/actions/admin/sample";
import { SettingType } from "@/actions/admin/settings";

export type DataFieldType = Record<SampleFieldAndDetailsType['type'], {
  fieldName: string,
  icon: string,
  Component: React.FC<any> | null,
  defaultValue?: any
}>

export const DATA_FIELDS: DataFieldType = {
  'string': { fieldName: "Plain text", icon: 'title', Component: InputAdmin },
  'slug': { fieldName: "Slug", icon: 'text_fields', Component: SlugInputAdmin },
  'text': { fieldName: "Rich text", icon: 'border_color', Component: RichTextAdmin },
  'int': { fieldName: "Number", icon: 'tag', Component: NumberAdmin },
  'bool': { fieldName: "Boolean", icon: 'toggle_on', Component: SwitchAdmin, defaultValue: false },
  'date': { fieldName: "Date Time", icon: 'calendar_today', Component: DatePickerAdmin },
  'file': { fieldName: "File", icon: 'attachment', Component: FileInputAdmin },
  'select': { fieldName: "Select", icon: 'checklist', Component: SelectAdmin },
  'relation': { fieldName: "Relation", icon: 'network_node', Component: RelationInputAdmin },
  'publish': { fieldName: "Publish", icon: 'publish', Component: null },
  'permissions': { fieldName: "Permission", icon: 'encrypted', Component: PermissionsInputAdmin },
  'password': { fieldName: "Password", icon: 'key', Component: PasswordInputAdmin },
  'custom': { fieldName: "Custom", icon: 'instant_mix', Component: InputAdmin},
}

export const findSettingByName = (arr: any[], name: string) : any | undefined => {
  return arr.find(v => v.name == name)?.value ?? undefined
}

export const checkPermissions = (permission: PermissionsOnRoles[], tableName: string, 
  key: 'browse' | 'create' | 'edit' | 'delete' | 'image' 
): boolean => {
  return permission.findIndex(v => v.permissionTableName == tableName && v.permissionKey == key) >= 0
}

export const createDefaultValue = (column: SampleColumnsType | SettingType) => {
  if (column.type == "custom" && column.details.defaultValue) {
    return column.details.defaultValue
  }

  const dataField = DATA_FIELDS[column.type]
  if (typeof dataField.defaultValue != "undefined") {
    return dataField.defaultValue
  }

  return ''
}