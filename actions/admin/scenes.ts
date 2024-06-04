"use server"
import { existsSync, mkdirSync } from "fs"
import sharp from "sharp"
import fsPromise from "fs/promises";
import path from 'path'
import { v4 } from 'uuid';
import PQueue from "p-queue";
import { InfoHotspot, LinkHotspot } from "@prisma/client";
import { createHistoryAdmin, getAdmin } from "./admin";
import { checkPermissions } from "@/lib/admin/fields";
import db from "@/lib/admin/db";
import { equirectangularToFisheye, renderFacePromise } from "@/lib/admin/scenes";

export const addEditScene = async ({
  name,name_en ,slug, imageId, audio,audio_en, group, description,description_en, latitude, longitude,
  publish, count, id
}: {
  name: string,name_en:string ,slug: string,
  imageId?: string, audio?: string,audio_en?:string,
  group?: string, description?: string, description_en?: string, latitude?: string, longitude?: string,
  publish: boolean, count?: number
  id?: string
}) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (!(id ? checkPermissions(user.role.permissions, "scene", "edit") 
      : checkPermissions(user.role.permissions, "scene", "create"))) {
      throw "Forbidden";
    }

    const image = await db.file.findUnique({
      where: {
        id: imageId,
        mime: {
          startsWith: 'image'
        }
      }
    })

    // create
    if (!id) {
      const sceneBySlug = await db.scene.findFirst({
        where: {
          slug
        }
      })
  
      if (sceneBySlug) throw "Slug đã tồn tại"

      if (!image) throw "Ảnh không tồn tại"

      let uuid = v4()

      await createImageForScene(image.url, uuid)

      const dataCreate = {
        id: uuid,
        name: name,
        name_en: name_en,
        slug: slug,
        faceSize: 8192,
        initialViewParameters: {
          pitch: 0,
          yaw: 0,
          zoom: 50
        },
        url: `/storage/tiles/${uuid}`,
        levels: `[]`,
        description: description,
        description_en:description_en,
        latitude: latitude,
        longitude: longitude,
        imageId: imageId,
        audioId: audio || undefined,
        audioEnId: audio_en || undefined,
        groupId: group || undefined,
        publish: publish ? 'publish' : 'draft'
      }
      await db.scene.create({
        data: {
          ...dataCreate,
          initialViewParameters: JSON.stringify(dataCreate.initialViewParameters),
          sort: count ? +count : 0
        }
      })

      await createHistoryAdmin({
        action: 'Tạo mới',
        title: 'Thêm mới điểm chụp',
        adminId: user.id,
        status: 'success',
        tableName: "scene",
        data: JSON.stringify(dataCreate, null, 2)
      })
    }
    // update
    else {
      const scene = await db.scene.findUnique({
        where: {
          id
        }
      })

      if (scene?.imageId != imageId) {
        if (!image) throw "Ảnh không tồn tại"
        
        await createImageForScene(image.url, id)
      }

      const dataCreate = {
        name: name,
        name_en: name_en,
        slug: slug,
        description: description,
        description_en:description_en,
        latitude: latitude,
        longitude: longitude,
        audioId: audio || undefined,
        audioEnId: audio_en || undefined,
        groupId: group || undefined,
        publish: publish ? 'publish' : 'draft'
      }

      await db.scene.update({
        where: {
          id: id,
        },
        data: dataCreate
      })

      await createHistoryAdmin({
        action: 'Cập nhập',
        title: 'Chỉnh sửa điểm chụp ' + name,
        adminId: user.id,
        status: 'success',
        tableName: "scene",
        data: JSON.stringify(dataCreate, null, 2)
      })
    }

    return { success: true }
  }
  catch(error) {
    await createHistoryAdmin({
      action: id ? 'Cập nhập' : 'Tạo mới',
      title: id ? 'Chỉnh sửa điểm chụp ' + name : 'Thêm mới điểm chụp',
      adminId: user.id,
      status: 'error',
      tableName: 'scene'
    }).catch(e => {})

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const deleteScene = async ({id}: {id: string}) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "scene", "delete")) throw "Forbidden"

    await db.$transaction([
      db.infoHotspot.deleteMany({
        where: {
          sceneId: id
        }
      }), 
      db.linkHotspot.deleteMany({
        where: {
          sceneId: id
        }
      }), 
      db.scene.delete({
        where: {
          id: id
        }
      })
    ])

    await fsPromise.rm(`./storage/tiles/${id}`, { recursive: true })

    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm chụp ' + id,
      adminId: user.id,
      status: 'success',
      tableName: "scene"
    })

    return { success: true }
  } 
  catch (error) {
    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm chụp ' + id,
      adminId: user.id,
      status: 'error',
      tableName: "scene"
    })

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const updateInitialViewParametersScene = async ({
  id, initialViewParameters
}: {
  id: string, initialViewParameters: string
}) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "scene", "edit")) throw "Forbidden"

    const scene = await db.scene.update({
      where: {
        id: id,
      },
      data: {
        initialViewParameters: initialViewParameters
      }
    })

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa tọa độ ban đầu điểm chụp ' + id,
      adminId: user.id,
      status: 'success',
      tableName: "scene",
      data: JSON.stringify({initialViewParameters: JSON.parse(initialViewParameters)}, null, 2)
    })

    return { success: true }
  }
  catch(error) {
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa tọa độ ban đầu điểm chụp ' + id,
      adminId: user.id,
      status: 'error',
      tableName: "scene",
      data: JSON.stringify({initialViewParameters: JSON.parse(initialViewParameters)}, null, 2)
    }).catch(e => {})

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const sortScene = async (list: string[]) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "scene", "edit")) throw "Forbidden"

    await db.$transaction(list.map((v,i) => {
      return db.scene.update({
        where: {
          id: v
        },
        data: {
          sort: i
        }
      })
    }))

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Sắp xếp danh sách điểm chụp',
      adminId: user.id,
      status: 'success',
      tableName: "scene"
    })

    return { success: true }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Sắp xếp danh sách điểm chụp',
      adminId: user.id,
      status: 'success',
      tableName: "scene"
    }).catch(e => {})

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const createEditHotspot = async ({
  id, sceneId, target, yaw, pitch, hotspotType, type, video,
  title, title_en, description, description_en
}: {
  id?: string, sceneId: string, target: string, yaw: string,
  pitch: string, hotspotType: string, type: string, video: string,
  title: string,title_en:string, description: string, description_en:string
}) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    let linkHotspot: LinkHotspot | undefined = undefined
    let infoHotspot: InfoHotspot | undefined = undefined

    if (hotspotType == "link") {
      if (!(id ? checkPermissions(user.role.permissions, "linkHotspot", "edit") 
        : checkPermissions(user.role.permissions, "linkHotspot", "create"))) {
        throw "Forbidden";
      }

      if (id) {
        linkHotspot = await db.linkHotspot.update({
          where: {
            id
          },
          data: {
            target: target,
            type: type
          }
        })

        await createHistoryAdmin({
          action: 'Cập nhập',
          title: 'Chỉnh sửa thông tin điểm nóng liên kết ' + id,
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify({
            target: target,
            type: type
          }, null, 2)
        })
      }
      else {
        const dataCreate = {
          sceneId: sceneId,
          yaw: +yaw,
          pitch: +pitch,
          target: target,
          type: type
        }
        
        linkHotspot = await db.linkHotspot.create({
          data: dataCreate
        })

        await createHistoryAdmin({
          action: 'Tạo mới',
          title: 'Thêm mới điểm nóng liên kết',
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify(dataCreate, null, 2)
        })
      }
    }
    else if (hotspotType == "info") {
      if (!(id ? checkPermissions(user.role.permissions, "infoHotspot", "edit") 
        : checkPermissions(user.role.permissions, "infoHotspot", "create"))) {
        throw "Forbidden";
      }
      
      if (id) {
        const dataCreate = {
          type: type,
          title: title,
          title_en: title_en,
          description: description,
          description_en: description_en,
          video: video
        }
        infoHotspot = await db.infoHotspot.update({
          where: {
            id
          },
          data: dataCreate
        })
        
        await createHistoryAdmin({
          action: 'Cập nhập',
          title: 'Chỉnh sửa điểm nóng thông tin ' + id,
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify(dataCreate, null, 2)
        })
      }
      else {
        const dataCreate = {
          sceneId: sceneId,
          yaw: +yaw,
          pitch: +pitch,
          type: type,
          title: title,
          title_en: title_en,
          description: description,
          description_en: description_en,
          video: video
        }

        infoHotspot = await db.infoHotspot.create({
          data: dataCreate
        })

        await createHistoryAdmin({
          action: 'Tạo mới',
          title: 'Thêm mới điểm nóng thông tin',
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify(dataCreate, null, 2)
        })
      }
    }
    else throw ""

    return { success: true, linkHotspot, infoHotspot }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: id ? 'Cập nhập' : 'Tạo mới',
      title: (id ? 'Chỉnh sửa điểm nóng' : 'Thêm mới điểm nóng') + hotspotType == "link" ? 'Liên kết' : 'Thông tin',
      adminId: user.id,
      status: 'error',
      tableName: hotspotType == "link" ? 'linkHotspot' : 'infoHotspot'
    }).catch(e => {})

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const createEditAdvancedHotspot = async ({
  id, sceneId, type, layerId, title, title_en, position
}: {
  id?: string, sceneId: string, type: 'layer' | 'polygon',
  position: { id: string, yaw: number, pitch: number }[],
  title: string,title_en:string, layerId?: string
}) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    const data = {
      sceneId,
      type,
      title,
      title_en,
      layerId,
      position: JSON.stringify(position)
    }

    if (!id) {
      await db.advancedHotspot.create({
        data: {
          ...data,
          id,
        }
      })
    }
    else {
      await db.advancedHotspot.update({
        where: {
          id
        },
        data
      })
    }

    return { success: true }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: id ? 'Cập nhập' : 'Tạo mới',
      title: id ? 'Chỉnh sửa điểm nóng nâng cao' : 'Thêm mới điểm nóng nâng cao',
      adminId: user.id,
      status: 'error',
      tableName: 'advancedHotspot'
    }).catch(e => {})

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const deleteHotspot = async ({id, type}: {id: string, type: 'link' | 'info' | 'advanced'}) => {
  const user = await getAdmin()
  if (!user) throw "Authorization"

  try {
    if (type == "link") {
      if (!checkPermissions(user.role.permissions, "linkHotspot", "delete")) throw "Forbidden"

      await db.linkHotspot.delete({
        where: {
          id: id
        }
      })
    }
    else if (type == "info") {
      if (!checkPermissions(user.role.permissions, "infoHotspot", "delete")) throw "Forbidden"

      await db.infoHotspot.delete({
        where: {
          id: id
        }
      })
    } else if (type == "advanced") {
      if (!checkPermissions(user.role.permissions, "infoHotspot", "delete")) throw "Forbidden"

      await db.advancedHotspot.delete({
        where: {
          id: id
        }
      })
    } else {
      throw ""
    }

    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm nóng ' + type == "link" ? 'liên kết ' : 'thông tin ' + id,
      adminId: user.id,
      status: 'success',
      tableName: type == "link" ? 'linkHotspot' : 'infoHotspot'
    })

    return { success: true }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm nóng ' + type == "link" ? 'liên kết ' : 'thông tin ' + id,
      adminId: user.id,
      status: 'error',
      tableName: type == "link" ? 'linkHotspot' : 'infoHotspot'
    })

    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

async function splitImage({
  imageSharp, numRows, numCols, outputDirectory, width, height
}:{
  imageSharp: sharp.Sharp, numRows: number, numCols: number, outputDirectory: string,
  width: number, height: number
}) {
  const queue = new PQueue({ concurrency: 4 })

  const chunkWidth = Math.floor(width / numCols)
  const chunkHeight = Math.floor(height / numRows)

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const x = col * chunkWidth
      const y = row * chunkHeight
      const outputImagePath = `${outputDirectory}/${row}_${col}.webp`;

      queue.add(async () => {
        await imageSharp.clone()
          .extract({ left: x, top: y, width: chunkWidth, height: chunkHeight })
          .webp()
          .toFile(outputImagePath)
      })
    }
  }

  await queue.onIdle()
}

async function createImageForScene (imageUrl: string, uuid: string) {
  const imageSharp = sharp(`.${imageUrl}`, { limitInputPixels: false })
      
  let { width: w = 0, height: h = 0} = await imageSharp.metadata()

  imageSharp.resize({ width: 8192, height: 4096, fit: 'fill' })
  h = 4096
  w = 8192

  if (!existsSync(`./storage/tiles/${uuid}`)) {
    mkdirSync(`./storage/tiles/${uuid}`, { recursive: true })
  }

  // slip image
  await splitImage({
    imageSharp: imageSharp.clone(),
    width: w,
    height: h,
    numCols: 8,
    numRows: 4,
    outputDirectory: `./storage/tiles/${uuid}`
  })

  // save image low
  await imageSharp.clone().resize({ width: 512, height: 256 }).webp({ quality: 60 }).toFile(`./storage/tiles/${uuid}/low.webp`)

  // create fisheye image
  await new Promise(res => res(equirectangularToFisheye(imageSharp.clone(), 256, `./storage/tiles/${uuid}/fisheye.webp`)))

  // create face front image
  const f = await renderFacePromise({
    data: imageSharp,
    width: w,
    height: h,
    face: 'nz',
    interpolation: "linear"
  })

  await sharp(f).resize({width: 1024}).webp().toFile(`./storage/tiles/${uuid}/front.webp`)
}