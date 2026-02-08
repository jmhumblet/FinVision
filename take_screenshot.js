import { chromium } from '@playwright/test';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log('Navigating to http://127.0.0.1:3000 ...');
  try {
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.error('Navigation failed:', e);
    await browser.close();
    process.exit(1);
  }
  
  console.log('Waiting for Continue as Guest button...');
  try {
    await page.waitForSelector('text=Continue as Guest', { timeout: 10000 });
    console.log('Clicking Continue as Guest...');
    await page.click('text=Continue as Guest');
  } catch (e) {
    console.error('Auth screen interaction failed:', e);
    await page.screenshot({ path: 'error_auth.png' });
    await browser.close();
    process.exit(1);
  }
  
  console.log('Waiting for dashboard...');
  await page.waitForTimeout(5000); 
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot.png', fullPage: false });
  
  await browser.close();
  console.log('Screenshot saved to screenshot.png');
})();