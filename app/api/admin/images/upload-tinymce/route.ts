import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: NextRequest): Promise<any> {
  try {
    const data = await request.formData()
    const file = data.get('file') as File
  
    if (!existsSync('./storage')){
      mkdirSync('./storage', { recursive: true });
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
     
    // let fileData = sharp(fileMin)
    let fileData = sharp(await file.arrayBuffer(), { animated: true })
    
    let metadata = await fileData.metadata()
    
    let name = v4() + "." + metadata.format
    let fileUrl = `./storage/tiny-mce/${name}`
  
    if (Object.keys(sharpCompress).findIndex(v => v == metadata.format || (v == "jpeg" && metadata.format == "jpg")) < 0) {
      throw "Không phải định dạng ảnh"
    }
  
    //@ts-ignore
    let fileSave = await fileData[metadata.format || "png"](compress[metadata.format || "png"]).toFile(fileUrl)
      .then((data: any) => {
        return data
      })
  
    let { format, size, width, height } = fileSave
  
    return { location: fileUrl.slice(1) }
  }
  catch (error) {
    console.log(error)
    return NextResponse.json("Error", {status: 400})
  }
}