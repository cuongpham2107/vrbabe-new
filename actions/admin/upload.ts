"use server"

import { FolderFile, File as FileDB } from "@prisma/client"
import { existsSync, mkdirSync } from "fs"
import fsPromise from "fs/promises"
import sharp from "sharp"
import { v4 } from "uuid"
import path from "path"
import { imageSize } from "image-size";
import mime from "mime-types";
import { FileTypeState } from "./sample"
import { getAdmin } from "./admin"
import { checkPermissions } from "@/lib/admin/fields"
import db from "@/lib/admin/db"

const getParentString = (depth = 1) => {

  let includeObject: any = {
    include: {parent: true}
  }
  let pointer = includeObject.include;
  for (let i = 0; i < depth - 1; i++) {
    pointer.parent = {include: {parent: true}};
    pointer = pointer.parent.include;
  }

  return includeObject
}

const mapFolderRecursiveToArray = (folderParent: any | null, arr: FolderFile[]) => {
  if (folderParent && folderParent.parent) {
    arr.push({...folderParent.parent, parent: undefined})
    mapFolderRecursiveToArray(folderParent.parent, arr)
  }
}

export const getListFolderFile = async ({
  tableName, parentId, fileTypes = ['image']
}: {tableName?: string, parentId?: string, fileTypes?: FileTypeState}) => {
  try {
    const user = await getAdmin()

    if (!user) throw "Authorization"

    const myself = tableName ? !checkPermissions(user.role.permissions, tableName, "image") : false

    let queryFile = fileTypes.includes('all') ? {
      mime: undefined
    } : {
      OR: fileTypes.map(v => ({
        mime: {
         startsWith: v
        } 
       }))
    }

    const [folderParent, folders, files] = await db.$transaction([
      db.folderFile.findUnique({
        where: {
          id: parentId || ''
        },
        include: getParentString(4).include
      }),
      db.folderFile.findMany({
        where: {
          tableName,
          parentId: parentId ? parentId : null,
          adminId: myself ? user.id : undefined
        },
      }),
      db.file.findMany({
        where: {
          tableName,
          folderFileId: parentId ? parentId : null,
          adminId: myself ? user.id : undefined,
          ...queryFile
        },
      }),
    ])

    let folderParents: any[] = []
    mapFolderRecursiveToArray({parent: folderParent}, folderParents)

    return {folderParents, folders, files}

  } catch (error) {
    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

type CreateEditFolderType = {
  folderId?: string,
  name: string, 
  tableName: string, 
  parentId?: string | null
} 

export const createEditFolder = async ({
  folderId, name, tableName, parentId
}: CreateEditFolderType) => {
  try {
    const user = await getAdmin()
    if (!user) throw "Authorization"

    let dataCreate = {
      name,
      adminId: user.id,
      tableName,
      parentId
    }

    const folder = folderId ? await db.folderFile.update({
      where: {
        id: folderId
      },
      data: dataCreate
    })
    : await db.folderFile.create({
      data: dataCreate
    })

    return {folder}

  } catch (error) {
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

const findFolderAndFileRecursive = async ({
  folderId, tableName, adminId, currentFolders, currentFiles
}: {
  folderId: string, tableName?: string, adminId?: string,
  currentFolders: {id: string}[], currentFiles: {id:string, url: string}[]
}) => {
  const [folders, files] = await db.$transaction([
    db.folderFile.findMany({
      where: {
        parentId: folderId,
        tableName,
        adminId
      },
      select: {
        id: true
      }
    }),
    db.file.findMany({
      where: {
        folderFileId: folderId,
        tableName,
        adminId
      },
      select: {
        id: true,
        url: true
      }
    })
  ])

  currentFolders.push(...folders)
  currentFiles.push(...files)

  await Promise.all(folders.map(v => findFolderAndFileRecursive({
    currentFiles,
    currentFolders,
    folderId: v.id,
    adminId,
    tableName
  })))
}

export const deleteFolder = async ({
  folderId, tableName
}: {
  folderId: string, tableName?: string
}) => {
  try {
    const user = await getAdmin()

    if (!user) throw "Authorization"
    const myself = tableName ? !checkPermissions(user.role.permissions, tableName, "image") : false

    const currentFiles: any[] = [],
      currentFolders: any[] = [
        { id: folderId }
      ]

    await findFolderAndFileRecursive({
      currentFiles,
      currentFolders,
      folderId,
      tableName,
      adminId: myself ? user.id : undefined
    })

    await Promise.all([
      await db.folderFile.deleteMany({
        where: {
          id: {
            in: currentFolders.map(v => v.id)
          }
        }
      }),
      await db.file.deleteMany({
        where: {
          id: {
            in: currentFiles.map(v => v.id)
          }
        }
      }),
      ...currentFiles.map(v => fsPromise.unlink(`.${v.url}`))
    ])

    return { message: 'Success'}

  } catch (error) {
    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

type UploadFilesType = {
  formData: FormData,
  tableName: string, 
  folderFileId?: string | null,
  fileTypes?: FileTypeState
} 

export const uploadFiles = async ({
  formData, tableName, folderFileId, fileTypes = ['image']
}: UploadFilesType) => {
  try {
    const user = await getAdmin()

    if (!user) throw "Unauthorized"
        
    if (!existsSync(`./storage/${tableName}`)){
      mkdirSync(`./storage/${tableName}`, { recursive: true });
    }

    const sharpCompress = {
      'png': {compressionLevel: 8, quality: 60},
      'jpeg': { quality: 60 },
      'webp': { quality: 60 },
      'gif': {},
      'jp2': {},
      'tiff': {},
      'avif': {},
      'heif': {},
      'jxl': {}
    }

    const files = formData.getAll('files[]') as File[]

    let res: any[] = []
    for (let file of files) {
      // check file
      const fileName = Buffer.from(file.name, 'binary').toString('utf8')
      const extension = path.extname(fileName)
      const mimeName = mime.lookup(extension)

      if (!isFileTypeAllowed(file.type) || !mimeName) {
        throw "Tập tin không hợp lệ"
      }

      let checkMimeType = false

      if (fileTypes.includes('all')) {
        checkMimeType = true
      }
      else {
        checkMimeType = fileTypes.some(v => mimeName.startsWith(v))
      }

      if (!checkMimeType) throw "Bạn không được tải lên tệp tin này"

      // upload image
      if (mimeName.startsWith('image/')) {
        if (Object.keys(sharpCompress).findIndex(v => `.${v}` == extension || extension == ".jpg") >= 0) {
          let fileData = sharp(await file.arrayBuffer(), { animated: true })
          
          let metadata = await fileData.metadata()
          
          let name = v4() + "." + metadata.format
          let fileUrl = `./storage/${tableName}/${name}`
      
          //@ts-ignore
          let fileSave = await fileData[metadata.format || "jpeg"](sharpCompress[metadata.format || "jpeg"]).toFile(fileUrl)
            .then((data: any) => {
              return data
            })
      
          let { size, width, height } = fileSave
      
          res.push({
            name: fileName,
            naturalWidth: width,
            naturalHeight: height,
            size: size,
            mime: mimeName,
            url: fileUrl.slice(1)
          })
        }
        else {
          let name = v4() + extension
          let fileUrl = `./storage/${tableName}/${name}`
  
          const fileBuffer = Buffer.from(await file.arrayBuffer())
  
          const {width, height} = imageSize(fileBuffer)
  
          await fsPromise.writeFile(fileUrl, fileBuffer)
  
          res.push({
            name: fileName,
            naturalWidth: width,
            naturalHeight: height,
            size: file.size,
            mime: mimeName,
            url: fileUrl.slice(1)
          })
        }
      }
      // upload file
      else {
        let name = v4() + extension
        let fileUrl = `./storage/${tableName}/${name}`

        const fileBuffer = Buffer.from(await file.arrayBuffer())

        await fsPromise.writeFile(fileUrl, fileBuffer)

        res.push({
          name: fileName,
          size: file.size,
          mime: mimeName,
          url: fileUrl.slice(1)
        })
      }
    }

    let filesData: FileDB[] = await db.$transaction(
      res.map(v => db.file.create({
        data: {
          ...v,
          tableName,
          folderFileId,
          adminId: user.id
        }
      }))
    )

    return { files: filesData }
  } catch (error) {
    console.log(error)
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const editFileData = async({
  id, name, caption, width, height
}: {
  id: string, name: string, caption?: string,
  width?: number, height?: number
}) => {
  try {
    const user = await getAdmin()

    if (!user) throw "Authorization"

    const file = await db.file.update({
      where: {
        id: id
      },
      data: {
        name,
        caption,
        width : width ? +width : undefined,
        height : height ? +height : undefined
      }
    })

    return {file}

  } catch (error) {
    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

export const deleteFileData = async({
  id, url
}: {
  id: string, url: string
}) => {
  try {
    const user = await getAdmin()

    if (!user) throw "Authorization"

    const file = await db.file.delete({
      where: {
        id: id
      }
    })

    await fsPromise.unlink(`.${url}`)

    return { message: 'Success'}

  } catch (error) {
    console.log({error})
    return { error: (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau' }
  }
}

const dangerousFileTypes = [
  'application/x-msdownload',
  'application/x-dosexec',
  'application/x-executable',
  'application/x-mach-binary',
  'application/x-sh',
  'application/x-shellscript',
  'application/javascript',
  'application/x-javascript',
  'application/x-msdownload',
  'application/x-dosexec',
  'application/x-shockwave-flash',
  'application/javascript',
  'application/x-javascript',
  'text/javascript',
  'text/x-javascript',
  'text/html',
  'text/x-php',
  'application/x-msi',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-gtar',
  'application/x-msdownload',
  'application/x-dosexec',
  'application/x-shockwave-flash',
]

function isFileTypeAllowed(type: string) {
  return !dangerousFileTypes.includes(type.toLowerCase());
}