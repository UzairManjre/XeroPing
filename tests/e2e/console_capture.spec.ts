import { test, expect } from '@playwright/test';

test('Capture console errors on EXIF page', async ({ page }) => {
  const errors: string[] = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  console.log('Navigating to EXIF page...');
  await page.goto('/tools/exif-remover');
  
  // Wait a bit to ensure initialization runs
  await page.waitForTimeout(2000);
  
  console.log('--- CAPTURED ERRORS ---');
  if (errors.length === 0) {
    console.log('No console errors found!');
  } else {
    errors.forEach(e => console.log('ERROR:', e));
  }
  console.log('-----------------------');
});
