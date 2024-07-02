"use server"

import db from "@/lib/admin/db"
import { headers } from "next/headers"
import { v4 } from "uuid";

export const createAccess = async () => {
  const headersInstance = headers()
  const userAgent = headersInstance.get('user-agent')
  const forwarded = headersInstance.get('x-forwarded-for')

  try {
    const ip = typeof forwarded == "string" ? forwarded.split(/, /)[0] : null
    let deviceType = 'PC'

    if (userAgent?.match(/Mobile|Android|iPhone|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i)) {
      deviceType = 'Mobile'
    } else if (userAgent?.match(/Tablet|iPad|Nexus 7/i)) {
      deviceType = 'Tablet'
    }

    await db.accessHistory.create({
      data: {
        id: v4(),
        device: deviceType,
        ip: ip
      }
    })
  } catch (error) {
    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const getCatergory = async (id:string) => {
  try {
    const data = await db.groupScene.findUnique({
      where: {
        id: id
      }
    })
    return data
  } catch (error) {
    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}