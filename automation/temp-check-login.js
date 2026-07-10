const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto('https://qa.cipherschools.com', { waitUntil: 'domcontentloaded' });
  console.log('loaded', page.url());
  try { await page.getByRole('button', { name: /accept all/i }).click({ timeout: 5000 }); } catch (e) { console.log('accept click', e.message); }
  try { await page.getByRole('button', { name: /reject all/i }).click({ timeout: 5000 }); } catch (e) { console.log('reject click', e.message); }
  const dialog = page.locator('div[role="dialog"]').filter({ hasText: /sign in/i }).first();
  console.log('dialog count', await dialog.count());
  const button = dialog.getByRole('button', { name: /sign in/i }).first();
  console.log('button count', await button.count());
  if (await button.count()) {
    await button.click();
    console.log('clicked');
  }
  await page.waitForTimeout(2000);
  console.log('body', await page.locator('body').innerText());
  await browser.close();
})().catch((err) => { console.error('ERR', err); process.exit(1); });
