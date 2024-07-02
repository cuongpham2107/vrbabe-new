import { SampleColumnsType, SampleFieldAndDetailsType } from "@/actions/admin/sample"

type TableType = {
  name: string,
  tableName: string,
  slug?: string,
  icon?: string,
  rowsPerPages: number[],
  columns: SampleColumnsType[]
  orderBy?: string,
  orderType?: 'asc' | 'desc'
}

export const TABLES_SAMPLE: TableType[] = [
  {
    name: 'Tài khoản',
    tableName: 'admin',
    slug: 'users',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
      { name: 'name', label: 'Tên', type: 'string', show: true, required: true},
      { name: 'email', label: 'Email', type: 'string', show: true, required: true},
      { name: 'image', label: 'Ảnh', type: 'file', show: true, details: { multiple: false, onlyTable: true }},
      { name: 'role', label: 'Quyền', type: 'relation', show: true, required: true, details: {
        typeRelation: 'many-to-one',
        tableNameRelation: 'role',
        titleRelation: 'name'
      }},
      { name: 'password', label: 'Password', type: 'password', show: false, required: true},
    
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
      { name: 'publish', label: 'Xuất bản', type: 'publish', show: true},
    ]
  },
  {
    name: 'Quyền',
    tableName: 'role',
    slug: 'roles',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
    
      { name: 'name', label: 'Tên', type: 'string', show: true, required: true},
      { name: 'permissions', label: 'Quyền', type: 'permissions', show: false, required: true, col: 12},
    
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
    ]
  },
  {
    name: 'Cài đặt',
    tableName: 'setting',
    slug: 'settings',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
    
      { name: 'name', label: 'Tên', type: 'string', show: true, required: true},
    
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
    ]
  },
  {
    name: 'Điểm chụp',
    tableName: 'scene',
    slug: 'scenes',
    icon: 'scene',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
      
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
      { name: 'publish', label: 'Xuất bản', type: 'publish', show: true},
    ]
  },
  {
    name: 'Danh mục',
    tableName: 'groupScene',
    slug: 'group',
    icon: 'category',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
    
      { name: 'name', label: 'Tên(vi)', type: 'string', show: true, required: true},
      { name: 'name_en', label: 'Name(en)', type: 'string', show: true, required: true},
      { name: 'parent', label: 'Danh mục cha', type: 'relation', show: true, details: {
        typeRelation: 'many-to-one',
        tableNameRelation: 'groupScene',
        titleRelation: 'name'
      }},
      { name: 'sort', label: 'Thứ tự', type: 'int', show: true},
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
      { name: 'publish', label: 'Xuất bản', type: 'publish', show: true},
    ],
    orderBy: 'sort',
    orderType: 'asc'
  },
  {
    name: 'Điểm nóng liên kết',
    tableName: 'linkHotspot',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
    
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
      { name: 'publish', label: 'Xuất bản', type: 'publish', show: true},
    ]
  },
  {
    name: 'Điểm nóng thông tin',
    tableName: 'infoHotspot',
    rowsPerPages: [10, 20, 50],
    columns: [
      { name: 'id', label: 'ID', type: 'string', show: true},
    
      { name: 'createdAt', label: 'Ngày tạo', type: 'date', show: true},
      { name: 'updatedAt', label: 'Ngày cập nhập', type: 'date', show: true},
      { name: 'publish', label: 'Xuất bản', type: 'publish', show: true},
    ]
  }
]

export type GroupSettingSampleType = {
  name: string,
  label?: string,
  settings: ({
    name: string,
    label?: string,
    col?: number
  } & SampleFieldAndDetailsType)[]
}

export const GROUP_SETTINGS: GroupSettingSampleType[] = [
  { name: "Site", settings: [
    { name: 'site title', label: 'Tiêu đề', type: 'string' },
    { name: 'site description', label: 'Mô tả', type: 'string' },
    { name: 'site logo', label: 'logo', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }},
    { name: 'site favicon', label: 'Favicon', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }},
    { name: 'banner', label: 'Banner', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }, col: 4},
    { name: 'main audio', label: 'Nhạc nền', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['audio']
    }, col: 4},
    { name: 'so do', label: 'Sơ đồ (google map)', type: 'string', col: 4 },
  ] },
  { name: "Admin", settings: [
    { name: 'admin title', label: 'Tiêu đề trang quản trị', type: 'string' },
    { name: 'admin description', label: 'Mô tả trang quản trị', type: 'string' },
    { name: 'admin logo', label: 'logo trang quản trị', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    } },
    { name: 'preview mode', label: 'Chế độ xem trước', type: 'bool' },
  ] }
]