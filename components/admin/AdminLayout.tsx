"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import HeaderAdmin from './HeaderAdmin';
import MenuAdmin from './MenuAdmin';
import { useStore } from 'zustand';
import useAdminMenu from '@/stores/admin/admin_menu';
import ClientOnly from '../CLientOnly';
import { AdminType } from '@/actions/admin/admin';
import { TABLES_SAMPLE } from '@/app/admin/(admin)/[slug]/table';

export type LinkState = {
  icon?: string,
  name: string,
  path: string,
  tableName?: string
}

export const MANAGER_LINKS: LinkState[] = [
  {
    icon: 'dashboard',
    name: "Bảng điều khiển",
    path: "/admin"
  }, 
  ...TABLES_SAMPLE.filter(v => v.slug && !["users", "roles", "settings"].includes(v.slug)).map(v => ({
    icon: v.icon,
    name: v.name,
    path: '/admin/' + v.slug,
    tableName: v.tableName 
  }))
]

export const GENERAL_LINKS: LinkState[] = [
  {
    icon: 'person',
    name: "Người dùng",
    tableName: 'admin',
    path: "/admin/users"
  },
  {
    icon: 'key',
    name: "Quyền",
    tableName: 'role',
    path: "/admin/roles"
  },
  {
    icon: 'settings',
    name: "Cài đặt",
    tableName: 'setting',
    path: "/admin/settings"
  }
]

const AdminLayout : React.FC<{
  children: React.ReactNode,
  userData: NonNullable<AdminType>
}> = ({children, userData}) => {

  const adminMenu = useStore(useAdminMenu, (state) => state)

  return (
    <ClientOnly>
      <div className='w-full min-h-screen bg-gray-100'>
        <MenuAdmin managerLinks={MANAGER_LINKS} generalLinks={GENERAL_LINKS} permissions={userData.role.permissions}/>
        <div 
          className='w-full transition-all'
          style={{paddingLeft: adminMenu?.open ? adminMenu?.width : "60px"}}
        >
          <HeaderAdmin managerLinks={MANAGER_LINKS} generalLinks={GENERAL_LINKS} adminUser={userData} />
          <div className="px-8 py-4">{children}</div>
        </div>
      </div>
    </ClientOnly>
  )
}

export default AdminLayout