const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const sharp = require('sharp');
    
    const imagesDir = path.join(__dirname, 'images');
    const files = fs.readdirSync(imagesDir).filter(file => 
      file.toLowerCase().endsWith('.webp') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')
    );
    
    console.log('Image Dimensions:');
    console.log('==================');
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      try {
        const metadata = await sharp(filePath).metadata();
        console.log(`"${file}": { width: ${metadata.width}, height: ${metadata.height} }`);
      } catch (err) {
        console.log(`"${file}": { error: "${err.message}" }`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
    console.log('Please install sharp first: npm install sharp');
  }
}

main();
