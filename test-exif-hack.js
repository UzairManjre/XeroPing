const piexif = require('piexifjs');

// Create a dummy EXIF blob (minimal valid EXIF)
const dummyExif = piexif.dump({
  "0th": {
    [piexif.ImageIFD.Make]: "FakeCamera"
  }
});

// dummyExif is a binary string starting with "Exif\0\0"
console.log("Raw EXIF starts with:", dummyExif.substring(0, 6));

// Build dummy JPEG
const hexToChar = hex => String.fromCharCode(parseInt(hex, 16));
const SOI = hexToChar('ff') + hexToChar('d8');
const APP1 = hexToChar('ff') + hexToChar('e1');
// Length includes length bytes themselves
const length = dummyExif.length + 2;
const len1 = hexToChar(Math.floor(length / 256).toString(16).padStart(2, '0'));
const len2 = hexToChar((length % 256).toString(16).padStart(2, '0'));
const EOI = hexToChar('ff') + hexToChar('d9');

const dummyJpeg = SOI + APP1 + len1 + len2 + dummyExif + EOI;

console.log("Dummy JPEG created. Attempting to parse with piexif.load...");

try {
  const loaded = piexif.load(dummyJpeg);
  console.log("SUCCESS! Parsed Make:", loaded["0th"][piexif.ImageIFD.Make]);
} catch (e) {
  console.error("FAILED:", e);
}
