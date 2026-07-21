const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['Desktop Chrome']
  });
  const page = await context.newPage();
  await page.goto('https://qa.cipherschools.com/');
  const signInBtn = page.getByRole('button', { name: 'Sign In' });
  await signInBtn.waitFor({ state: 'visible', timeout: 5000 });
  await signInBtn.click();
  await page.waitForTimeout(2000);
  // check if 'Hey, Learner' text exists
  const heyLearnerCount = await page.getByText(/Hey,? Learner/i).count();
  console.log('Hey Learner count:', heyLearnerCount);
  if (heyLearnerCount > 0) {
    const text = await page.getByText(/Hey,? Learner/i).first().textContent();
    console.log('Found text:', text);
  } else {
    // If not found, let's dump the text of the modal
    const modalText = await page.locator('.modal-content, [role="dialog"], [class*="modal"]').first().textContent().catch(() => 'no modal found');
    console.log('Modal text:', modalText);
  }
  
  // also check if email input exists
  const emailExists = await page.locator('input[type="email"]').count();
  console.log('Email input count:', emailExists);
  
  await browser.close();
})();
