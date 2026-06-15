const { ImageMagick, initializeImageMagick, MagickFormat } = require('@imagemagick/magick-wasm');
const fs = require('fs');

async function testMagick() {
  await initializeImageMagick(); // Loads WASM
  
  // Create a dummy image
  ImageMagick.read("logo:", (image) => {
    // How to strip profile?
    image.strip(); // Strips all profiles
    console.log("Image stripped of all profiles successfully.");
    
    // Can we strip specific profiles?
    // image.removeProfile("EXIF:GPSLatitude"); // Magick.NET has removeProfile, let's see if wasm has it
    if (typeof image.removeProfile === 'function') {
      console.log("Has removeProfile!");
    } else {
      console.log("No removeProfile method exposed in wasm.");
    }
  });
}

testMagick().catch(console.error);
