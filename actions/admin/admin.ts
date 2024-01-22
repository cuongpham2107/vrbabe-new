'use server'

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from 'bcrypt'
import { exclude } from "@/lib/utils/hepler";
import { signToken, verifyToken } from "@/lib/admin/jwt";
import { removeSpace } from "@/lib/utils/validator";
import db from "@/lib/admin/db";
import { Admin, File, PermissionsOnRoles, Role } from "@prisma/client";
import { NextRequest } from "next/server";

export type AdminType = Omit<Admin, "password"> & {
  image: File | null
  role: Role & {
    permissions: PermissionsOnRoles[]
  }
} | null

export const getAdmin = async (request?: NextRequest) => {
  const cookieTokenAdmin = cookies().get('token-admin')?.value
  
  try {
    let cookie = null

    if (request) {
      cookie = request.headers.get('authorization')?.split(' ')[1] || request.cookies.get('token-admin')?.value
    }
    else {
      cookie = cookieTokenAdmin
    }

    let adminId = null

    if (cookie) {
      let temp = await verifyToken(cookie)
      if (temp?.payload.sub) {
        adminId = temp.payload.sub
      }
    }

    if (!adminId) {
      throw ""
    }

    const user = await db.admin.findUnique({
      where: {
        id: adminId
      },
      include: {
        image: {
          where: {
            mime: {
              startsWith: 'image'
            }
          }
        },
        role: {
          include: {
            permissions: true
          }
        }
      }
    })

    const userWithoutPassword: AdminType = exclude(user, ['password'])

    return userWithoutPassword
  } catch (error) {
    console.log({error})
    return null
  }
}

export const logoutAdmin = async () => {
  'use server'

  const adminId = cookies().get('token-admin')?.value

  if (adminId) {
    await createHistoryAdmin({
      action: 'Đăng xuất',
      adminId: adminId,
      status: 'success',
      title: 'Đã đăng xuất tại trang quản trị',
    })
  }

  cookies().delete('token-admin')
  redirect('/admin')
}

export const loginAdmin = async ({
  email, password, remember
}: {
  email: string,
  password: string,
  remember: string
}) => {
  try {
    const userData = await db.admin.findUnique({
      where: {
        email: removeSpace(email)
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true
      }
    })

    if (!userData) {
      throw "Email not found"
    }

    if (!await bcrypt.compare(password, userData.password || '')) {
      throw "Password is corrected"
    }

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
    }

    const token = await signToken(user.id.toString(), remember ? "60d" : "1d")

    cookies().set({
      name: 'token-admin',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: remember ? 86400 * 60 : 86400
    })

    await createHistoryAdmin({
      action: 'Đăng nhập',
      adminId: user.id,
      status: 'success',
      title: 'Đăng nhập mới tại trang quản trị',
    })

    return { user }

  } catch (error) {
    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const createHistoryAdmin = async ({
  action, status, title, tableName, adminId, data
}: {
  action: 'Đăng nhập' | 'Cập nhập' | 'Tạo mới' | 'Xóa' | 'Đăng xuất' | 'Tải lên', 
  status: 'success' | 'error',
  title: string, tableName?: string,
  adminId: string, data?: string
}) => {
  try {
    await db.adminHistory.create({
      data: {
        action,
        status,
        title,
        tableName,
        adminId,
        data
      }
    })
  } catch (error) {
    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const updateProfile = async ({
  name, email, imageId, password
}: {
  name: string,
  email: string,
  imageId?: string,
  password?: string
}) => {
  "use server"
  try {
    const user = await getAdmin()
    if (!user) throw "Authorization"

    await db.admin.update({
      where: {
        id: user.id
      },
      data: {
        name,
        email,
        imageId: imageId || undefined,
        password: password || undefined
      }
    })

  } catch (error) {
    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}