const { chromium } = require('playwright');
const cfg = require('./config/test.config');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: cfg.baseUrl,
    storageState: { cookies: [], origins: [] },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log(`Navigating to ${cfg.baseUrl}/ ...`);
  await page.goto('/');
  
  console.log('Waiting for Sign In button...');
  const signInBtn = page.getByRole('button', { name: 'Sign In' });
  await signInBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(e => console.log('Sign In btn not visible!'));
  
  console.log('Clicking Sign In...');
  await signInBtn.click();
  
  console.log('Waiting for email input...');
  const emailInput = page.locator('input[type="email"]');
  try {
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Email input is VISIBLE!');
  } catch (e) {
    console.log('Email input is NOT VISIBLE.');
    
    // Check if there are multiple elements?
    const count = await emailInput.count();
    console.log(`Found ${count} email inputs in DOM.`);
    
    // Dump the HTML to see what's covering it or why modal didn't open
    await page.screenshot({ path: 'debug_screenshot.png' });
    console.log('Screenshot saved to debug_screenshot.png');
  }
  
  await browser.close();
})();
