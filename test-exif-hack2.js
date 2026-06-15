const piexif = require('piexifjs');

const dummyExif = piexif.dump({
  "0th": {
    [piexif.ImageIFD.Make]: "FakeCamera"
  }
});

const hexToChar = hex => String.fromCharCode(parseInt(hex, 16));
const emptyJpeg = hexToChar('ff') + hexToChar('d8') + hexToChar('ff') + hexToChar('d9');

try {
  // Insert the raw EXIF string into the empty JPEG
  const dummyJpeg = piexif.insert(dummyExif, emptyJpeg);
  
  // Now try to load it
  const loaded = piexif.load(dummyJpeg);
  console.log("SUCCESS! Parsed Make:", loaded["0th"][piexif.ImageIFD.Make]);
} catch (e) {
  console.error("FAILED:", e);
}
