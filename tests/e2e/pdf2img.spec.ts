import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify PDF to IMG conversion in PDF Toolkit', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  console.log('Navigating to PDF Toolkit page...');
  await page.goto('http://localhost:3000/tools/pdf-toolkit');
  
  console.log('Selecting PDF -> IMG tab...');
  // Find the button with text containing "PDF -> IMG" or "pdf2img" and click it
  await page.click('button:has-text("PDF -> IMG")');
  
  console.log('Uploading dummy.pdf...');
  const fileInput = page.locator('input[type="file"]');
  const testPdfPath = path.resolve(__dirname, '../../QA_Test_Assets/dummy.pdf');
  await fileInput.setInputFiles(testPdfPath);
  
  // Wait for thumbnail preview generation
  console.log('Waiting for thumbnail preview...');
  await page.waitForTimeout(2000);
  
  console.log('Executing task...');
  await page.click('button:has-text("Execute Task")');
  
  // Wait for processing
  console.log('Waiting for processing to complete...');
  await page.waitForTimeout(5000);
  
  const statusLocator = page.locator('.bg-rose-500, .bg-emerald-400');
  if (await statusLocator.count() > 0) {
    const text = await statusLocator.first().innerText();
    console.log('Result Status Box Text:', text);
  }
  
  console.log('Total console errors caught:', errors.length);
  expect(errors.length).toBe(0);
});
