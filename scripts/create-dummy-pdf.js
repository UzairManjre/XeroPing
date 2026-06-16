const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  page.drawText('Hello Zero Ping PDF Test Document!', { x: 50, y: 350, size: 24 });
  page.drawText('This is page 1 of the test PDF.', { x: 50, y: 300, size: 14 });
  
  const page2 = pdfDoc.addPage([600, 400]);
  page2.drawText('This is page 2 of the test PDF.', { x: 50, y: 300, size: 14 });

  const pdfBytes = await pdfDoc.save();
  const destDir = path.join(__dirname, '..', 'QA_Test_Assets');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }
  fs.writeFileSync(path.join(destDir, 'dummy.pdf'), pdfBytes);
  console.log('Dummy PDF created successfully at QA_Test_Assets/dummy.pdf');
}

createPdf().catch(console.error);
