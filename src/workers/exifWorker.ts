import * as Comlink from 'comlink';
import exifr from 'exifr';
import * as piexif from 'piexifjs';

function bufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    // @ts-ignore
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return binary;
}

function binaryStringToBuffer(binary: string): ArrayBuffer {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xff;
  }
  return bytes.buffer;
}

const exifWorker = {
  getExifData: async (buffer: ArrayBuffer): Promise<any> => {
    try {
      const data = await exifr.parse(buffer, { tiff: true, xmp: true, exif: true, gps: true });
      return data || {};
    } catch {
      return {};
    }
  },

  stripExif: async (buffer: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> => {
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      try {
        const binaryStr = bufferToBinaryString(buffer);
        const exifObj = piexif.load(binaryStr);
        // Wipe metadata
        exifObj["0th"] = {};
        exifObj["Exif"] = {};
        exifObj["GPS"] = {};
        exifObj["1st"] = {};
        exifObj["thumbnail"] = undefined;
        
        const exifBytes = piexif.dump(exifObj);
        const newBinaryStr = piexif.insert(exifBytes, binaryStr);
        return binaryStringToBuffer(newBinaryStr);
      } catch {
        // fallback
      }
    }
    
    // Fallback to canvas
    try {
      const blob = new Blob([buffer], { type: mimeType });
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('OffscreenCanvas context fail');
      ctx.drawImage(bitmap, 0, 0);
      const cleanBlob = await canvas.convertToBlob({ type: mimeType, quality: 1 });
      return await cleanBlob.arrayBuffer();
    } catch (e: any) {
      throw new Error(`Strip EXIF failed: ${e.message}`);
    }
  }
};

Comlink.expose(exifWorker);
export type ExifWorkerAPI = typeof exifWorker;
