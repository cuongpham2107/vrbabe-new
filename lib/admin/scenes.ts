// import { ImageData, createCanvas } from "canvas";
import sharp, { type Sharp } from "sharp";

function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(x, min));
}

function mod(x: number, n: number) {
  return ((x % n) + n) % n;
}

function copyPixelNearest(read: any, write: any) {
  const { width, height, data } = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: any) => {

    const nearest = readIndex(
      clamp(Math.round(xFrom), 0, width - 1),
      clamp(Math.round(yFrom), 0, height - 1)
    );

    for (let channel = 0; channel < 3; channel++) {
      write.data[to + channel] = data[nearest + channel];
    }
  };
}

function copyPixelBilinear(read: any, write: any) {
  const { width, height, data } = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: any) => {
    const xl = clamp(Math.floor(xFrom), 0, width - 1);
    const xr = clamp(Math.ceil(xFrom), 0, width - 1);
    const xf = xFrom - xl;

    const yl = clamp(Math.floor(yFrom), 0, height - 1);
    const yr = clamp(Math.ceil(yFrom), 0, height - 1);
    const yf = yFrom - yl;

    const p00 = readIndex(xl, yl);
    const p10 = readIndex(xr, yl);
    const p01 = readIndex(xl, yr);
    const p11 = readIndex(xr, yr);

    for (let channel = 0; channel < 3; channel++) {
      const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
      const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
      write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
    }
  };
}

// performs a discrete convolution with a provided kernel
function kernelResample(read: any, write: any, filterSize: number, kernel: any) {
  const { width, height, data } = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  const twoFilterSize = 2 * filterSize;
  const xMax = width - 1;
  const yMax = height - 1;
  const xKernel = new Array(4);
  const yKernel = new Array(4);

  return (xFrom: number, yFrom: number, to: any) => {
    const xl = Math.floor(xFrom);
    const yl = Math.floor(yFrom);
    const xStart = xl - filterSize + 1;
    const yStart = yl - filterSize + 1;

    for (let i = 0; i < twoFilterSize; i++) {
      xKernel[i] = kernel(xFrom - (xStart + i));
      yKernel[i] = kernel(yFrom - (yStart + i));
    }

    for (let channel = 0; channel < 3; channel++) {
      let q = 0;

      for (let i = 0; i < twoFilterSize; i++) {
        const y = yStart + i;
        const yClamped = clamp(y, 0, yMax);
        let p = 0;
        for (let j = 0; j < twoFilterSize; j++) {
          const x = xStart + j;
          const index = readIndex(clamp(x, 0, xMax), yClamped);
          p += data[index + channel] * xKernel[j];

        }
        q += p * yKernel[i];
      }

      write.data[to + channel] = Math.round(q);
    }
  };
}

function copyPixelBicubic(read: any, write: any) {
  const b = -0.5;
  const kernel = (x: number) => {
    x = Math.abs(x);
    const x2 = x * x;
    const x3 = x * x * x;
    return x <= 1 ?
      (b + 2) * x3 - (b + 3) * x2 + 1 :
      b * x3 - 5 * b * x2 + 8 * b * x - 4 * b;
  };

  return kernelResample(read, write, 2, kernel);
}

function copyPixelLanczos(read: any, write: any) {
  const filterSize = 5;
  const kernel = (x: number) => {
    if (x === 0) {
      return 1;
    }
    else {
      const xp = Math.PI * x;
      return filterSize * Math.sin(xp) * Math.sin(xp / filterSize) / (xp * xp);
    }
  };

  return kernelResample(read, write, filterSize, kernel);
}

const orientations = {
  pz: (out: any, x: number, y: number) => {
    out.x = -1;
    out.y = -x;
    out.z = -y;
  },
  nz: (out: any, x: number, y: number) => {
    out.x = 1;
    out.y = x;
    out.z = -y;
  },
  px: (out: any, x: number, y: number) => {
    out.x = x;
    out.y = -1;
    out.z = -y;
  },
  nx: (out: any, x: number, y: number) => {
    out.x = -x;
    out.y = 1;
    out.z = -y;
  },
  py: (out: any, x: number, y: number) => {
    out.x = -y;
    out.y = -x;
    out.z = 1;
  },
  ny: (out: any, x: number, y: number) => {
    out.x = y;
    out.y = -x;
    out.z = -1;
  }
};

export async function renderFacePromise({ 
  data, width, height, face, rotation = Math.PI, interpolation, maxWidth = Infinity 
}: {
  data: Sharp, width: number, height: number, face: string, rotation?: number,
  interpolation?: 'linear'| 'cubic'| 'lanczos', maxWidth?: number
}): Promise<Buffer> {
  return new Promise(async res => {
    // console.log({ face })
    const faceWidth = Math.min(maxWidth, width / 4)
    const faceHeight = faceWidth;

    const cube: any = {};
    const orientation = (orientations as any)[face];

    // const writeData = ctx.getImageData(0, 0, faceWidth, faceHeight)

    const readData = {
      width: width,
      height: height,
      data: await data.raw().ensureAlpha().toBuffer()

    }

    const writeData = {
      width: faceWidth,
      height: faceHeight,
      data: new Array(faceWidth * faceHeight * 4)
    }

    const copyPixel =
      interpolation === 'linear' ? copyPixelBilinear(readData, writeData) :
        interpolation === 'cubic' ? copyPixelBicubic(readData, writeData) :
          interpolation === 'lanczos' ? copyPixelLanczos(readData, writeData) :
            copyPixelNearest(readData, writeData);

    for (let x = 0; x < faceWidth; x++) {
      for (let y = 0; y < faceHeight; y++) {
        const to = 4 * (y * faceWidth + x);

        // fill alpha channel
        writeData.data[to + 3] = 255;

        // get position on cube face
        // cube is centered at the origin with a side length of 2
        orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));

        // project cube face onto unit sphere by converting cartesian to spherical coordinates
        const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
        const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
        const lat = Math.acos(cube.z / r);

        copyPixel(readData.width * lon / Math.PI / 2 - 0.5, readData.height * lat / Math.PI - 0.5, to);
      }
    }

    const input = Uint8Array.from(writeData.data)
    const cubeMapBuffer = await sharp(input, {
      // because the input does not contain its dimensions or how many channels it has
      // we need to specify it in the constructor options
      raw: {
        width: writeData.width,
        height: writeData.height,
        channels: 4
      }
    }).jpeg().toBuffer()

    res(cubeMapBuffer)
  })
}

export async function equirectangularToFisheye(imageSharp: Sharp, size: number, path?: string) {
  const width = size * 2
  const height = size
  const radius = size / 2
  const center = size / 2
  const fisheyeAngle = Math.PI / 2 // Góc xoay mong muốn (ở đây là 45 độ)

  const outputBuffer = new Array(size * size * 4)

  const inputBuffer = await imageSharp.resize({ width: size * 2, height: size }).png().raw().ensureAlpha().toBuffer()

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center
      const dy = y - center
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= radius) {
        // Áp dụng góc xoay vào tính toán theta
        const theta = Math.atan2(dy, dx)
        const phi = (distance / radius) * fisheyeAngle

        const u = (theta + Math.PI) / (2 * Math.PI)
        const v = 1 - phi / Math.PI

        const sourceX = Math.floor(u * width)
        const sourceY = Math.floor(v * height)

        const sourceIdx = (sourceY * width + sourceX) * 4
        const targetIdx = (y * size + x) * 4

        outputBuffer[targetIdx] = inputBuffer[sourceIdx]
        outputBuffer[targetIdx + 1] = inputBuffer[sourceIdx + 1]
        outputBuffer[targetIdx + 2] = inputBuffer[sourceIdx + 2]
        outputBuffer[targetIdx + 3] = inputBuffer[sourceIdx + 3]
      }
    }
  }

  const input = Uint8Array.from(outputBuffer)
  const cubeMapBuffer = sharp(input, {
    // because the input does not contain its dimensions or how many channels it has
    // we need to specify it in the constructor options
    raw: {
      width: size,
      height: size,
      channels: 4
    }
  })

  if (path != undefined) {
    await cubeMapBuffer.webp().toFile(path);
  }
  else {
    return await cubeMapBuffer.webp().toBuffer()
  }
}