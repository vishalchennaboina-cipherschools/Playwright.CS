import { test, expect } from '@playwright/test';


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
    await page.getByRole('button', { name: 'Signin' }).click();


    // Verify login
    await expect(page.getByText('Login Successful')).toBeVisible();
});
