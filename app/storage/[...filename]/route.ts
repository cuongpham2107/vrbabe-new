import { NextResponse } from "next/server";
import * as fs from 'fs/promises';
import { existsSync, mkdirSync, createReadStream } from "fs";
import { extname } from "path";
import mime from "mime-types";

export async function GET(request: Request, { params } : { params: {filename: string | string[]} }) {
  try {
    
    const filepath = './storage/' + (Array.isArray(params.filename) ? (params.filename as string[]).join("/") : params.filename as string)

    if (!existsSync(filepath)){
      throw 'Not found'
    }

    const fileStream = await fs.readFile(filepath)

    const file_extension = extname(filepath);
    const mimeName = mime.lookup(file_extension)

    return new Response(fileStream, {
      headers: {
        'Content-Type': mimeName || '',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }
  catch (e) {
    console.log(e)
    return NextResponse.json("Error", {status: 400})
  }
}