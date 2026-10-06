const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header Box
  page.drawRectangle({
    x: 40,
    y: 750,
    width: 515,
    height: 60,
    color: rgb(0.05, 0.35, 0.3),
  });

  page.drawText('AMLAK FINANCE PJSC', {
    x: 60,
    y: 785,
    size: 20,
    font: fontBold,
    color: rgb(1, 0.85, 0.2),
  });

  page.drawText('Official Liability Certificate & Outstanding Statement', {
    x: 60,
    y: 765,
    size: 11,
    font: fontRegular,
    color: rgb(1, 1, 1),
  });

  // Date and Reference
  page.drawText(`Date: ${new Date().toLocaleDateString('en-GB')}`, {
    x: 40,
    y: 710,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText('Ref No: AMLAK/LIAB/2026/8942', {
    x: 380,
    y: 710,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Line Divider
  page.drawLine({
    start: { x: 40, y: 695 },
    end: { x: 555, y: 695 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Body Content
  page.drawText('TO WHOM IT MAY CONCERN', {
    x: 40,
    y: 660,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const bodyText = [
    'This is to certify that Amlak Finance PJSC holds liability records for the customer',
    'specified below. This document is issued upon request of the account holder for verification',
    'and clearance purposes.',
  ];

  let yPos = 635;
  for (const line of bodyText) {
    page.drawText(line, {
      x: 40,
      y: yPos,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPos -= 18;
  }

  // Details Table Box
  page.drawRectangle({
    x: 40,
    y: 470,
    width: 515,
    height: 120,
    color: rgb(0.97, 0.98, 0.98),
    borderColor: rgb(0.85, 0.88, 0.88),
    borderWidth: 1,
  });

  const details = [
    ['Bank Name:', 'Amlak Finance PJSC'],
    ['Account Number:', 'AB1234567890'],
    ['Account Holder:', 'Jannat Shaikh'],
    ['Facility Type:', 'Residential Home Finance'],
    ['Issue Date:', '02-10-2026'],
    ['Expiry Date:', '03-10-2027'],
  ];

  let dy = 565;
  for (const [label, val] of details) {
    page.drawText(label, { x: 60, y: dy, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(val, { x: 200, y: dy, size: 10, font: fontRegular, color: rgb(0.1, 0.4, 0.3) });
    dy -= 17;
  }

  // Footer Note Box
  page.drawRectangle({
    x: 40,
    y: 380,
    width: 515,
    height: 60,
    color: rgb(0.95, 0.97, 0.95),
    borderColor: rgb(0.7, 0.85, 0.7),
    borderWidth: 1,
  });

  page.drawText('IMPORTANT SECURITY NOTICE:', {
    x: 55,
    y: 420,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.4, 0.3),
  });

  page.drawText(
    'This letter includes an automated digital verification QR code embedded by VerifyLetter system.',
    { x: 55, y: 402, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) }
  );

  // Output File Path
  const targetPath = path.join(__dirname, '..', '..', 'Sample_Liability_Letter.pdf');
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(targetPath, pdfBytes);
  console.log(`✅ Sample PDF created successfully at: ${targetPath}`);
}

createSamplePdf().catch(console.error);
