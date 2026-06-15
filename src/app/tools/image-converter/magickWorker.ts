import * as Comlink from 'comlink';
import { initializeImageMagick, ImageMagick, MagickFormat } from '@imagemagick/magick-wasm';

let isInitialized = false;

async function init() {
  if (!isInitialized) {
    try {
      const response = await fetch('/magick.wasm');
      if (!response.ok) throw new Error(`Failed to fetch magick.wasm: ${response.statusText}`);
      const wasmBytes = new Uint8Array(await response.arrayBuffer());
      await initializeImageMagick(wasmBytes);
      isInitialized = true;
    } catch (err: any) {
      throw new Error(`WASM Init Failed: ${err.message}`);
    }
  }
}

export interface ConvertOptions {
  maxWidth?: number;
  width?: number;
  height?: number;
  quality?: number;
  targetFormat: string;
}

const api = {
  async convertImage(arrayBuffer: ArrayBuffer, options: ConvertOptions): Promise<{ buffer: ArrayBuffer, mime: string }> {
    await init();
    
    return new Promise((resolve, reject) => {
      try {
        const uint8Array = new Uint8Array(arrayBuffer);
        
        ImageMagick.read(uint8Array, (image) => {
          // Resize if needed
          if (options.width && options.height) {
            image.resize(options.width, options.height);
          } else if (options.width) {
            const ratio = options.width / image.width;
            image.resize(options.width, Math.round(image.height * ratio));
          } else if (options.height) {
            const ratio = options.height / image.height;
            image.resize(Math.round(image.width * ratio), options.height);
          } else if (options.maxWidth && image.width > options.maxWidth) {
            const ratio = options.maxWidth / image.width;
            image.resize(options.maxWidth, Math.round(image.height * ratio));
          }

          // Set quality
          if (options.quality) {
            image.quality = Math.round(options.quality * 100);
          }

          // Determine output format
          let outFormat: any = MagickFormat.WebP;
          let outMime = 'image/webp';
          
          if (options.targetFormat === 'image/jpeg') {
             outFormat = MagickFormat.Jpeg;
             outMime = 'image/jpeg';
          } else if (options.targetFormat === 'image/png') {
             outFormat = MagickFormat.Png;
             outMime = 'image/png';
          } else if (options.targetFormat === 'image/avif') {
             outFormat = MagickFormat.Avif;
             outMime = 'image/avif';
          } else if (options.targetFormat === 'image/gif') {
             outFormat = MagickFormat.Gif;
             outMime = 'image/gif';
          } else if (options.targetFormat === 'image/bmp') {
             outFormat = MagickFormat.Bmp;
             outMime = 'image/bmp';
          } else if (options.targetFormat === 'image/tiff') {
             outFormat = MagickFormat.Tiff;
             outMime = 'image/tiff';
          } else if (options.targetFormat === 'image/x-icon') {
             outFormat = MagickFormat.Ico;
             outMime = 'image/x-icon';
          } else if (options.targetFormat === 'image/heic') {
             outFormat = MagickFormat.Heic;
             outMime = 'image/heic';
          } else if (options.targetFormat === 'application/pdf') {
             outFormat = MagickFormat.Pdf;
             outMime = 'application/pdf';
          }

          image.write(outFormat, (data) => {
            // Slice the Uint8Array to create a copy before returning
            const outBuffer = data.slice().buffer;
            resolve({ buffer: outBuffer, mime: outMime });
          });
        });
      } catch (err: any) {
        reject(new Error(`ImageMagick processing error: ${err.message || String(err)}`));
      }
    });
  }
};

export type MagickWorkerType = typeof api;

Comlink.expose(api);
