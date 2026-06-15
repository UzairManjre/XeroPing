import * as Comlink from 'comlink';
import exifr from 'exifr';
import * as piexif from 'piexifjs';

// Helper: Safely convert ArrayBuffer to binary string without blowing the stack
function bufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    // @ts-ignore - apply accepts subarray
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

// Lossless PNG chunk metadata stripper
function stripPngMetadata(buffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  
  if (uint8[0] !== 0x89 || uint8[1] !== 0x50 || uint8[2] !== 0x4E || uint8[3] !== 0x47) {
    throw new Error("Not a PNG file");
  }
  
  const parts: Uint8Array[] = [];
  parts.push(uint8.subarray(0, 8)); // Add PNG signature
  
  let offset = 8;
  while (offset < buffer.byteLength) {
    if (offset + 12 > buffer.byteLength) break;
    const length = view.getUint32(offset);
    const chunkType = String.fromCharCode(uint8[offset + 4], uint8[offset + 5], uint8[offset + 6], uint8[offset + 7]);
    const chunkTotalLength = 12 + length;
    
    if (offset + chunkTotalLength > buffer.byteLength) break;
    
    // Filter out metadata and profile chunks
    const isMetadata = ['tEXt', 'zTXt', 'iTXt', 'eXIf', 'iCCP', 'tIME'].includes(chunkType);
    
    if (!isMetadata) {
      parts.push(uint8.subarray(offset, offset + chunkTotalLength));
    }
    
    offset += chunkTotalLength;
  }
  
  const totalSize = parts.reduce((sum, p) => sum + p.length, 0);
  const cleanUint8 = new Uint8Array(totalSize);
  let curOffset = 0;
  for (const part of parts) {
    cleanUint8.set(part, curOffset);
    curOffset += part.length;
  }
  return cleanUint8.buffer;
}

// Lossless WebP chunk metadata stripper
function stripWebpMetadata(buffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  
  if (String.fromCharCode(uint8[0], uint8[1], uint8[2], uint8[3]) !== 'RIFF' ||
      String.fromCharCode(uint8[8], uint8[9], uint8[10], uint8[11]) !== 'WEBP') {
    throw new Error("Not a WebP file");
  }
  
  const parts: Uint8Array[] = [];
  parts.push(uint8.subarray(0, 12)); // RIFF + size + WEBP
  
  let offset = 12;
  while (offset < buffer.byteLength) {
    if (offset + 8 > buffer.byteLength) break;
    const chunkType = String.fromCharCode(uint8[offset], uint8[offset + 1], uint8[offset + 2], uint8[offset + 3]);
    const chunkSize = view.getUint32(offset + 4, true);
    const paddedSize = chunkSize + (chunkSize % 2);
    const chunkTotalLength = 8 + paddedSize;
    
    if (offset + chunkTotalLength > buffer.byteLength) break;
    
    const isMetadata = ['EXIF', 'XMP ', 'ICCP'].includes(chunkType);
    
    if (!isMetadata) {
      if (chunkType === 'VP8X' && chunkSize >= 1) {
        const vp8xData = uint8.subarray(offset, offset + chunkTotalLength);
        const newVp8x = new Uint8Array(vp8xData);
        // Clear flags for EXIF (bit 2), XMP (bit 3), and ICC (bit 0)
        newVp8x[8] = newVp8x[8] & 0x12;
        parts.push(newVp8x);
      } else {
        parts.push(uint8.subarray(offset, offset + chunkTotalLength));
      }
    }
    
    offset += chunkTotalLength;
  }
  
  const totalSize = parts.reduce((sum, p) => sum + p.length, 0);
  const cleanUint8 = new Uint8Array(totalSize);
  let curOffset = 0;
  for (const part of parts) {
    cleanUint8.set(part, curOffset);
    curOffset += part.length;
  }
  
  const cleanView = new DataView(cleanUint8.buffer);
  cleanView.setUint32(4, totalSize - 8, true);
  
  return cleanUint8.buffer;
}

export type ExifCategoryData = {
  [category: string]: { label: string; value: string }[];
};

export type ExifAnalysis = {
  hasExif: boolean;
  isJpeg: boolean;
  gps?: { lat: number; lng: number };
  make?: string;
  model?: string;
  dateTime?: string;
  exhaustiveData?: ExifCategoryData;
};

export type RedactionOptions = {
  stripGps: boolean;
  stripSettings: boolean;
  stripTime: boolean;
  stripAuthor: boolean;
};

const formatVal = (val: any) => {
  if (val === undefined || val === null) return 'N/A';
  if (val instanceof Date) return val.toLocaleString();
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const exifWorker = {
  
  analyzeImage: async (fileBuffer: ArrayBuffer, mimeType: string): Promise<ExifAnalysis> => {
    let hasExif = false;
    let gps, make, model, dateTime;
    let exhaustiveData: ExifCategoryData = {};
    const isJpeg = mimeType === 'image/jpeg' || mimeType === 'image/jpg';

    try {
      const rawExif = await exifr.parse(fileBuffer, { tiff: true, xmp: true, exif: true, gps: true, mergeOutput: true });
      if (rawExif && Object.keys(rawExif).length > 0) {
        hasExif = true;
        make = rawExif.Make;
        model = rawExif.Model;
        dateTime = rawExif.DateTimeOriginal || rawExif.CreateDate || rawExif.ModifyDate;
        
        if (dateTime instanceof Date) dateTime = dateTime.toLocaleString();
        if (rawExif.latitude && rawExif.longitude) gps = { lat: rawExif.latitude, lng: rawExif.longitude };

        exhaustiveData = {
          "Camera Information": [
            { label: "Make", value: formatVal(rawExif.Make) },
            { label: "Model", value: formatVal(rawExif.Model) },
            { label: "Lens Model", value: formatVal(rawExif.LensModel) },
            { label: "Lens Make", value: formatVal(rawExif.LensMake) },
            { label: "Serial Number", value: formatVal(rawExif.SerialNumber) },
            { label: "Internal Serial Number", value: formatVal(rawExif.InternalSerialNumber) },
            { label: "Software", value: formatVal(rawExif.Software) },
            { label: "Firmware Version", value: formatVal(rawExif.FirmwareVersion) }
          ],
          "Image Settings": [
            { label: "Orientation", value: formatVal(rawExif.Orientation) },
            { label: "Exposure Time", value: formatVal(rawExif.ExposureTime) },
            { label: "F-Number", value: formatVal(rawExif.FNumber) },
            { label: "ISO", value: formatVal(rawExif.ISO) },
            { label: "Focal Length", value: formatVal(rawExif.FocalLength) },
            { label: "Focal Length (35mm)", value: formatVal(rawExif.FocalLengthIn35mmFormat) },
            { label: "Flash", value: formatVal(rawExif.Flash) },
            { label: "White Balance", value: formatVal(rawExif.WhiteBalance) },
            { label: "Exposure Program", value: formatVal(rawExif.ExposureProgram) },
            { label: "Exposure Mode", value: formatVal(rawExif.ExposureMode) },
            { label: "Exposure Bias", value: formatVal(rawExif.ExposureBiasValue) },
            { label: "Metering Mode", value: formatVal(rawExif.MeteringMode) },
            { label: "Shutter Speed", value: formatVal(rawExif.ShutterSpeedValue) },
            { label: "Aperture", value: formatVal(rawExif.ApertureValue) },
            { label: "Max Aperture", value: formatVal(rawExif.MaxApertureValue) },
            { label: "Brightness", value: formatVal(rawExif.BrightnessValue) },
            { label: "Subject Distance", value: formatVal(rawExif.SubjectDistance) },
            { label: "Scene Capture Type", value: formatVal(rawExif.SceneCaptureType) },
            { label: "Scene Type", value: formatVal(rawExif.SceneType) },
            { label: "Gain Control", value: formatVal(rawExif.GainControl) },
            { label: "Contrast", value: formatVal(rawExif.Contrast) },
            { label: "Saturation", value: formatVal(rawExif.Saturation) },
            { label: "Sharpness", value: formatVal(rawExif.Sharpness) },
            { label: "Light Source", value: formatVal(rawExif.LightSource) },
            { label: "Digital Zoom Ratio", value: formatVal(rawExif.DigitalZoomRatio) }
          ],
          "GPS Data": [
            { label: "Latitude", value: formatVal(rawExif.latitude || rawExif.GPSLatitude) },
            { label: "Longitude", value: formatVal(rawExif.longitude || rawExif.GPSLongitude) },
            { label: "Altitude", value: formatVal(rawExif.GPSAltitude) },
            { label: "Latitude Ref", value: formatVal(rawExif.GPSLatitudeRef) },
            { label: "Longitude Ref", value: formatVal(rawExif.GPSLongitudeRef) },
            { label: "Altitude Ref", value: formatVal(rawExif.GPSAltitudeRef) },
            { label: "GPS Date Stamp", value: formatVal(rawExif.GPSDateStamp) },
            { label: "GPS Time Stamp", value: formatVal(rawExif.GPSTimeStamp) },
            { label: "GPS Speed", value: formatVal(rawExif.GPSSpeed) },
            { label: "GPS Speed Ref", value: formatVal(rawExif.GPSSpeedRef) },
            { label: "GPS Img Direction", value: formatVal(rawExif.GPSImgDirection) },
            { label: "GPS Img Direction Ref", value: formatVal(rawExif.GPSImgDirectionRef) },
            { label: "GPS Dest Bearing", value: formatVal(rawExif.GPSDestBearing) },
            { label: "GPS Dest Bearing Ref", value: formatVal(rawExif.GPSDestBearingRef) }
          ],
          "Date & Time": [
            { label: "Date/Time Original", value: formatVal(rawExif.DateTimeOriginal) },
            { label: "Create Date", value: formatVal(rawExif.CreateDate) },
            { label: "Modify Date", value: formatVal(rawExif.ModifyDate) },
            { label: "Date/Time Digitized", value: formatVal(rawExif.DateTimeDigitized) },
            { label: "Sub Sec Time", value: formatVal(rawExif.SubSecTime) },
            { label: "Sub Sec Time Original", value: formatVal(rawExif.SubSecTimeOriginal) },
            { label: "Sub Sec Time Digitized", value: formatVal(rawExif.SubSecTimeDigitized) }
          ],
          "Author & Copyright": [
            { label: "Artist", value: formatVal(rawExif.Artist) },
            { label: "Copyright", value: formatVal(rawExif.Copyright) }
          ],
          "Image Properties": [
            { label: "Image Width", value: formatVal(rawExif.ImageWidth) },
            { label: "Image Height", value: formatVal(rawExif.ImageHeight) },
            { label: "Bits Per Sample", value: formatVal(rawExif.BitsPerSample) },
            { label: "Samples Per Pixel", value: formatVal(rawExif.SamplesPerPixel) },
            { label: "Color Space", value: formatVal(rawExif.ColorSpace) },
            { label: "Compression", value: formatVal(rawExif.Compression) },
            { label: "Photometric Interpretation", value: formatVal(rawExif.PhotometricInterpretation) },
            { label: "Resolution Unit", value: formatVal(rawExif.ResolutionUnit) },
            { label: "X Resolution", value: formatVal(rawExif.XResolution) },
            { label: "Y Resolution", value: formatVal(rawExif.YResolution) },
            { label: "YCbCr Positioning", value: formatVal(rawExif.YCbCrPositioning) },
            { label: "Planar Configuration", value: formatVal(rawExif.PlanarConfiguration) },
            { label: "Exif Version", value: formatVal(rawExif.ExifVersion) },
            { label: "FlashPix Version", value: formatVal(rawExif.FlashpixVersion) },
            { label: "Components Configuration", value: formatVal(rawExif.ComponentsConfiguration) },
            { label: "Compressed Bits Per Pixel", value: formatVal(rawExif.CompressedBitsPerPixel) }
          ],
          "Thumbnail Information": [
            { label: "Thumbnail Offset", value: formatVal(rawExif.ThumbnailOffset) },
            { label: "Thumbnail Length", value: formatVal(rawExif.ThumbnailLength) },
            { label: "Thumbnail Compression", value: formatVal(rawExif.ThumbnailCompression) },
            { label: "Thumbnail X Resolution", value: formatVal(rawExif.ThumbnailXResolution) },
            { label: "Thumbnail Y Resolution", value: formatVal(rawExif.ThumbnailYResolution) }
          ]
        };
      }
    } catch (e) {
      hasExif = false;
    }

    return { hasExif, isJpeg, gps, make, model, dateTime, exhaustiveData };
  },

  processImage: async (fileBuffer: ArrayBuffer, mimeType: string, options: RedactionOptions) => {
    // Lossless JPEG selective redaction
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      try {
        const binaryStr = bufferToBinaryString(fileBuffer);
        const exifObj = piexif.load(binaryStr);

        if (options.stripAuthor && exifObj["0th"]) {
          delete exifObj["0th"][piexif.ImageIFD.Artist];
          delete exifObj["0th"][piexif.ImageIFD.Copyright];
          delete exifObj["0th"][piexif.ImageIFD.Software];
        }

        if (options.stripTime && exifObj["0th"]) {
          delete exifObj["0th"][piexif.ImageIFD.DateTime];
        }

        if (options.stripSettings && exifObj["Exif"]) {
          exifObj["Exif"] = {};
        } else if (options.stripTime && exifObj["Exif"]) {
          delete exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal];
          delete exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized];
        }

        if (options.stripGps && exifObj["GPS"]) {
          exifObj["GPS"] = {};
        }

        const exifBytes = piexif.dump(exifObj);
        const newBinaryStr = piexif.insert(exifBytes, binaryStr);
        const newBuffer = binaryStringToBuffer(newBinaryStr);

        return {
          status: 'stripped',
          message: 'Selective redaction completed losslessly.',
          buffer: newBuffer,
        };
      } catch (err: any) {
        console.error("Selective JPEG strip failed, falling back to brute force", err);
      }
    }

    // Lossless PNG chunk-level metadata strip
    if (mimeType === 'image/png') {
      try {
        const newBuffer = stripPngMetadata(fileBuffer);
        return {
          status: 'stripped',
          message: 'PNG metadata stripped losslessly.',
          buffer: newBuffer,
        };
      } catch (err: any) {
        console.error("Lossless PNG strip failed, falling back to brute force", err);
      }
    }

    // Lossless WebP chunk-level metadata strip
    if (mimeType === 'image/webp') {
      try {
        const newBuffer = stripWebpMetadata(fileBuffer);
        return {
          status: 'stripped',
          message: 'WebP metadata stripped losslessly.',
          buffer: newBuffer,
        };
      } catch (err: any) {
        console.error("Lossless WebP strip failed, falling back to brute force", err);
      }
    }

    // Fallback: OffscreenCanvas draw (re-compresses/wipes completely)
    try {
      const blob = new Blob([fileBuffer], { type: mimeType });
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get OffscreenCanvas context');
      ctx.drawImage(bitmap, 0, 0);
      const cleanBlob = await canvas.convertToBlob({ type: mimeType, quality: 1 });
      const cleanBuffer = await cleanBlob.arrayBuffer();

      return {
        status: 'stripped',
        message: 'Full metadata wipe applied via visual rendering fallback.',
        buffer: cleanBuffer,
      };
    } catch (error: any) {
      throw new Error(`Brute-force processing failed: ${error.message}`);
    }
  },

  updateMetadata: async (fileBuffer: ArrayBuffer, updates: { make?: string; model?: string; dateTime?: string; lat?: number; lng?: number }): Promise<ArrayBuffer> => {
    try {
      const binaryStr = bufferToBinaryString(fileBuffer);
      const exifObj = piexif.load(binaryStr);

      if (updates.make !== undefined && exifObj["0th"]) {
        exifObj["0th"][piexif.ImageIFD.Make] = updates.make;
      }
      if (updates.model !== undefined && exifObj["0th"]) {
        exifObj["0th"][piexif.ImageIFD.Model] = updates.model;
      }
      if (updates.dateTime !== undefined && exifObj["0th"]) {
        exifObj["0th"][piexif.ImageIFD.DateTime] = updates.dateTime;
      }
      if (updates.dateTime !== undefined && exifObj["Exif"]) {
        exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = updates.dateTime;
        exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized] = updates.dateTime;
      }
      
      if (updates.lat !== undefined && updates.lng !== undefined) {
        const latRef = updates.lat >= 0 ? 'N' : 'S';
        const lngRef = updates.lng >= 0 ? 'E' : 'W';
        const absLat = Math.abs(updates.lat);
        const absLng = Math.abs(updates.lng);
        
        const latDeg = Math.floor(absLat);
        const latMin = Math.floor((absLat - latDeg) * 60);
        const latSec = Math.round(((absLat - latDeg) * 60 - latMin) * 60 * 100);
        
        const lngDeg = Math.floor(absLng);
        const lngMin = Math.floor((absLng - lngDeg) * 60);
        const lngSec = Math.round(((absLng - lngDeg) * 60 - lngMin) * 60 * 100);

        exifObj["GPS"] = {
          [piexif.GPSIFD.GPSVersionID]: [2, 2, 0, 0],
          [piexif.GPSIFD.GPSLatitudeRef]: latRef,
          [piexif.GPSIFD.GPSLatitude]: [[latDeg, 1], [latMin, 1], [latSec, 100]],
          [piexif.GPSIFD.GPSLongitudeRef]: lngRef,
          [piexif.GPSIFD.GPSLongitude]: [[lngDeg, 1], [lngMin, 1], [lngSec, 100]],
        };
      }

      const exifBytes = piexif.dump(exifObj);
      const newBinaryStr = piexif.insert(exifBytes, binaryStr);
      return binaryStringToBuffer(newBinaryStr);
    } catch (e: any) {
      throw new Error(`Metadata edit failed: ${e.message}`);
    }
  }
};

Comlink.expose(exifWorker);
export type ExifWorkerType = typeof exifWorker;
