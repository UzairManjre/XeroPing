import { test, expect } from '@playwright/test';

test('Worker UI should display exact error or process successfully', async ({ page }) => {
  await page.goto('/');
  
  // Click the worker button
  await page.click('button:has-text("Fire Web Worker")');
  
  // Wait a moment for processing or error
  await page.waitForTimeout(1000);
  
  // Extract the status text to see the exact error
  const statusText = await page.locator('.text-indigo-400').innerText();
  console.log('--- UI STATUS CAPTURED ---');
  console.log(statusText);
  console.log('--------------------------');
  
  // Also click the counter button to test responsiveness
  await page.click('button:has-text("Click me during processing!")');
  const countText = await page.locator('button:has-text("Click me during processing!")').innerText();
  console.log('Counter button text:', countText);
});
