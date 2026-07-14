import { test, expect } from '@playwright/test';

test('Login with valid credentials', async ({ page }) => {
    await page.goto('https://qa.cipherschools.com/');

    // Open login popup
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Fill credentials
    await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
    await page.locator('input[type="password"]').fill('123456789000');

    await page.getByRole('button', { name: 'Signin' }).click();

    // Wait until login completes
    // await page.waitForLoadState('networkidle');

    // Verify login using a permanent UI element
    //await expect(page.getByText('Hey Monke')).toBeVisible();

    // await expect(page.getByText('Hey Monke')).toBeVisible();   


});