// @ts-check
import { test, expect } from '@playwright/test';

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
  await page.getByRole('button', { name: 'Signin' }).click();


  // Verify login
  await expect(page.getByText('Login Successful')).toBeVisible();
});

//phase 2 Verify the dashboard page after login
test('Verify dashboard page after login', async ({ page }) => {
  test.setTimeout(80000);

  await page.goto('https://qa.cipherschools.com');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Verify dashboard page
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/profile');
  test.setTimeout(80000);
  await expect(page.getByRole('heading', { name: 'Monkey D Luffy' })).toBeVisible();
  await page.locator('#ps-my-profile').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/profile/me');
  await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();
  await page.getByRole('link', { name: 'Enrolled Courses' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/profile/enrollments?publicPage=1&restrictedPage=1');
  await expect(page.getByRole('heading', { name: 'Premium courses' })).toBeVisible();
  await page.getByRole('link', { name: 'Certificates' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/profile/certificates');
  await expect(page.getByRole('heading', { name: 'Certificates & Badges' })).toBeVisible();
  await page.getByRole('link', { name: 'Wishlist' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/profile/wishlist');
  await expect(page.getByRole('heading', { name: 'Wishlist videos' })).toBeVisible();
  await page.getByRole('link', { name: 'Liked Videos' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/profile/liked-videos');
  await expect(page.getByRole('heading', { name: 'Liked videos' })).toBeVisible();
});
// phase 3 verify courses
test('Verify courses page', async ({ page }) => {
  test.setTimeout(80000);

  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Navigate to courses page
  await page.locator('#msp-courses').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/courses');
  await expect(page.getByRole('heading', { name: 'Recommended Courses' })).toBeVisible();
});
// Phase 4 verify the batches page
test('verify batches page', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://qa.cipherschools.com/');

  // Open login popup

  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials

  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Navigate to batches page

  await page.locator('#msp-batches').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches');
  await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();
  await page.locator('#batches-newe6f52').getByRole('link').filter({ hasText: /^$/ }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52');
  await expect(page.getByRole('heading', { name: 'Hey Monkey D' })).toBeVisible();

  // Syllabus page verification

  await page.locator('#msp-syllabus').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/syllabus');
  await expect(page.getByRole('heading', { name: 'Syllabus' })).toBeVisible();

  // lectures page verification

  await page.getByRole('link', { name: 'Lectures' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/contents/NjllNzAyNmE4YjM2M2EzNzk2NmY2NWNh');
  await expect(page.getByRole('heading', { name: 'Lecture Stages' })).toBeVisible();

  // Calendar page verification

  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/calendar');
  await expect(page.getByRole('heading', { name: 'My Calendar' })).toBeVisible();

  // Practice page verification

  await page.locator('#msp-practice').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/problems');
  await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();

  // practice sub section problems and assignment 

  await page.locator('#tab-problems').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/problems?type=additional');
  await expect(page.getByRole('columnheader', { name: 'PROBLEM' })).toBeVisible();

  await page.locator('#tab-assignments').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/problems?type=assignments');
  await expect(page.getByText(/NEW ASSIGNMENT/i)).toBeVisible();

  // test page verification 

  await page.getByRole('link', { name: 'Tests' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/tests');
  await expect(page.getByRole('heading', { name: 'Proctored Test' })).toBeVisible();

  // Project Page verification

  await page.getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/projects');
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

  // resources page verification

  await page.getByRole('link', { name: 'Resources' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/resources');
  await expect(page.getByRole('heading', { name: 'Resources' })).toBeVisible();

  // Performance page verification

  await page.getByRole('link', { name: 'Performance' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/performance');
  await expect(page.getByRole('heading', { name: 'Student Performance' })).toBeVisible();

  //Updates page verification

  await page.getByRole('link', { name: 'Updates' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/announcements');
  await expect(page.getByRole('heading', { name: 'Updates' })).toBeVisible();

  // Help & Support page verification

  await page.getByRole('link', { name: 'Help & Support' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches/newe6f52/support');
  await expect(page.getByRole('heading', { name: 'Quick Troubleshoot' })).toBeVisible();

  // My Batches button verifivation this makes user/student come back to the batches page from any other page of the batch

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  await page.getByRole('link', { name: 'My Batches' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches');
  await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();
});

// practice tab aka cipher labs page verification
test('Verify practice tab aka cipher labs page', async ({ page }) => {
  test.setTimeout(80000);

  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Navigate to practice tab aka cipher labs page

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  await page.getByRole('link', { name: 'CipherLabs' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/practice');
  await expect(page.getByRole('heading', { name: 'Master the Art of' })).toBeVisible();
  await page.getByRole('link', { name: 'Start Practicing Now' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/practice/problems');
  await expect(page.getByRole('heading', { name: 'Problem Set' })).toBeVisible();

  // start a problem and submit the solution

  await page.getByRole('link', { name: 'Practice Max Unique Candies Half Limit' }).click();


  await expect(page).toHaveURL(/max-unique-candies-half-limit/);

  const solution = `
  public static int distributeCandies(int[] candyType, int n) {
      HashSet<Integer> set = new HashSet<>();

      for (int candy : candyType) {
          set.add(candy);
      }

      return Math.min(set.size(), n / 2);
  }
  `;

  const editor = page.locator('.monaco-editor').first();

  await page.getByRole('combobox').first().click();
  await page.locator('select').selectOption({ label: 'JAVA' });

  await editor.click();

  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(solution);
  await page.getByRole('button', { name: 'Run Code' }).click();
  await expect(page.getByRole('heading', { name: 'Accepted' })).toBeVisible();
});

// rewards page verification
test('Verify rewards page', async ({ page }) => {

  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Navigate to rewards page

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  await page.getByRole('link', { name: 'Rewards' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/rewards/cipherpoints | https://qa.cipherschools.com/?login=true ');
  await expect(page.getByRole('heading', { name: 'Check-in Missions' })).toBeVisible();
});

// Resume page verification

test('Verify resume page', async ({ page }) => {
  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Navigate to resume page

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  await page.getByRole('link', { name: 'Resume' }).click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/resume-builder');
  await expect(page.getByRole('heading', { name: 'Make an ATS-Friendly Resume in Minutes ' })).toBeVisible();
});

// Side Nave bar verification
test('Verify side navigation bar', async ({ page }) => {
  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Verify side navigation bar

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  await page.locator('#msp-courses').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/courses');
  await expect(page.getByRole('heading', { name: 'Recommended Courses' })).toBeVisible();
  await page.locator('#msp-batches').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/batches');
  await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();
  await page.locator('#msp-practice').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/practice');
  await expect(page.getByRole('heading', { name: 'Master the Art of' })).toBeVisible();
  await page.locator('#msp-rewards').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/rewards/cipherpoints');
  await expect(page.getByRole('heading', { name: 'Check-in Missions' })).toBeVisible();
  await page.locator('#msp-resume').click();
  await expect(page).toHaveURL('https://qa.cipherschools.com/resume-builder');
  await expect(page.getByRole('heading', { name: 'Make an ATS-Friendly Resume in Minutes ' })).toBeVisible();
});

// logout test
test('Logout test', async ({ page }) => {
  await page.goto('https://qa.cipherschools.com/');

  // Open login popup
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Fill credentials
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456789000');
  await page.getByRole('button', { name: 'Signin' }).click();

  // Logout

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  await page.locator('li').filter({ hasText: 'Logout' }).click();
  await expect(page.getByText(/Successfully Logged out|Successfully logged Out/i)).toBeVisible();
  await expect(page).toHaveURL('https://qa.cipherschools.com/');
  await expect(page.getByRole('img', { name: /signin|register/i }).first()).toBeVisible();
});