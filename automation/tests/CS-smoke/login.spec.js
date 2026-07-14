// @ts-check
import { test, expect } from '@playwright/test';

async function clickSignin(page) {
  const signInButton = page.getByRole('button', { name: /^Signin$/i });
  await expect(signInButton).toBeVisible({ timeout: 20000 });
  await expect(signInButton).toBeEnabled({ timeout: 20000 });
  await signInButton.click();
}

test('CipherSchools', async ({ page }) => {
  test.setTimeout(60000); // Set timeout to 60 seconds
  await page.goto('https://qa.cipherschools.com/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Best Free Programming Courses Online | Learning Platform for All/);
});
// phase 1 login test
test('Login with valid credentials', async ({ page }) => {
  // test.setTimeout(80000);

  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for popup
  // await expect(page.getByLabel('Email ID')).toBeVisible();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await clickSignin(page);


  // Verify login
  await expect(page.getByText('Login Successful')).toBeVisible();
});