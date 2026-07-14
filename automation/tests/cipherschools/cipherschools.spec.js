// @ts-check
import { test, expect } from '@playwright/test';

test('CipherSchools', async ({ page }) => {
  test.setTimeout(60000); // Set timeout to 60 seconds
  await page.goto('https://qa.labs.codefri.com/');

    await expect(page).toHaveTitle(/Codefri LMS/);


  // Expect a title "to contain" a substring.
  //await expect(page).toHaveTitle(/Best Free Programming Courses Online | Learning Platform for All/);
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
  await expect(page.getByPlaceholder('Search assignments...')).toBeVisible();

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
  await expect(page.getByRole('heading', { name: 'Resources', exact: true })).toBeVisible();

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

// site map urls check 

const urls = [
  'https://www.cipherschools.com/',
  'https://www.cipherschools.com/about-us',
  'https://www.cipherschools.com/alumni',
  'https://www.cipherschools.com/campus-invite',
  'https://www.cipherschools.com/career-path',
  'https://www.cipherschools.com/careers',
  'https://www.cipherschools.com/contact',
  'https://www.cipherschools.com/courses',
  'https://www.cipherschools.com/courses/app-development',
  'https://www.cipherschools.com/courses/c-programming-course-beginner-to-advanced-0c5f/writing-our-first-code-in-c-0d46',
  'https://www.cipherschools.com/courses/cyber-security-fundamentals-core-concepts-and-practices-75f4/lecture-1-introduction-to-cyber-security-part-1-ba3c',
  'https://www.cipherschools.com/courses/data-science',
  'https://www.cipherschools.com/courses/machine-learning-beginner-friendly-c841/class-1-git-and-git-hub-c842',
  'https://www.cipherschools.com/courses/data-structures',
  'https://www.cipherschools.com/courses/database-management-system-654d/lecture0-introduction-to-dbms-69e8',
  'https://www.cipherschools.com/courses/figma-basic-uiux-in-hindi-d594/figma-basics-in-hindi-d596',
  'https://www.cipherschools.com/courses/game-development',
  'https://www.cipherschools.com/courses/javascript-zero-to-hero-complete-course-in-hindi-ae5b/javascript-beginning-to-mastery-complete-tutorial-class-1-ae5c',
  'https://www.cipherschools.com/courses/learn-numpy-library-in-english-8554/numpy-install-advantages-similarities-in-numpy-and-list-class1-8555',
  'https://www.cipherschools.com/courses/learn-to-apply-data-analysis-on-datasets-seaborn-and-matplotlib-plots-9246/class-1-data-analysis-on-google-apps-rating-part01-data-set-analysis-english-tutorial-data-science-9248',
  'https://www.cipherschools.com/courses/machine-learning',
  'https://www.cipherschools.com/courses/master-go-golang-programming-the-complete-go-bootcamp-0c58/course-overview-by-instructor-c4a0',
  'https://www.cipherschools.com/courses/mastering-devops-beginner-friendly-42c7/lecture1-introduction-to-computer-network-networking-devices-42c8',
  'https://www.cipherschools.com/courses/mega-react-tutorial-project-1-understanding-the-basics-cfec/react-mega-tutorial-project-1-part-1-learn-react-basics-by-building-the-name-it-app-cfed',
  'https://www.cipherschools.com/courses/mern-mongo-db-express-js-react-js-node-js-full-stack-series-8b33/what-is-mern-how-it-works-class-1-8b34',
  'https://www.cipherschools.com/courses/openlayers-3320/lecture-1-introduction-to-openlayers-playlist-3321',
  'https://www.cipherschools.com/courses/others',
  'https://www.cipherschools.com/courses/programming',
  'https://www.cipherschools.com/courses/python-for-beginners-eeb2/class-01-operators-errors-keywords-and-identifiers-datatypes-in-english-eebe',
  'https://www.cipherschools.com/courses/python-for-machine-learning-beginner-friendly-17c3/part-01-machine-learning-full-course-machine-learning-tutorial-ml-for-beginners-17c4',
  'https://www.cipherschools.com/courses/react-js-beginner-friendly-project-based-7ba9/introduction-to-the-course-class-1-7baa',
  'https://www.cipherschools.com/courses/react-js-bootcamp-for-interviewplacement-preparation-0c5d/instructors-introduction-course-overview-c42c',
  'https://www.cipherschools.com/courses/scratch-by-mit-game-development-logic-building-using-nocode-22fd/introduction-why-you-or-your-kid-should-learn-scratch-22ff',
  'https://www.cipherschools.com/courses/spark-webinar-series-for-entrepreneurs-9731/conversation-with-naina-lal-kidwaicountry-head-of-hsbc-india-and-meena-ganesh100x-entrepreneur-podcast-9732',
  'https://www.cipherschools.com/courses/sql-tutorial-for-beginners-a5dd/lecture-1-database-introduction-sql-mysql-dbms-hindi-a5de',
  'https://www.cipherschools.com/courses/technical-bootcamps-workshops-by-cipherschools-788d/game-development-workshop-ft-adhiraj-788f',
  'https://www.cipherschools.com/courses/the-beginners-guide-to-microsoft-excel-excel-training-c5a2/unnoticable-things-when-storing-information-in-excel-c5e6',
  'https://www.cipherschools.com/courses/ui-design-mastery-a-journey-into-ui-design-excellence-187b/shoes-store-landing-page-design-under-10-mins-187d',
  'https://www.cipherschools.com/courses/unveiling-opportunities-journeying-beyond-domains-0e51/isro-space-careers-roadmap%C2%A0to%C2%A0isro-0e53',
  'https://www.cipherschools.com/courses/web-development',
  'https://www.cipherschools.com/courses/web-development-beginner-friendly-8a18/class-1-complete-html-and-css-course-in-hindi-introduction-557a',
  'https://www.cipherschools.com/free-content-policy',
  'https://www.cipherschools.com/privacy',
  'https://www.cipherschools.com/rewards',
  'https://www.cipherschools.com/resume-builder',
  'https://www.cipherschools.com/support-us',
  'https://www.cipherschools.com/terms-and-condition',
  'https://www.cipherschools.com/trending-courses',
  'https://www.cipherschools.com/videos',
  'https://www.cipherschools.com/practice',
  'https://www.cipherschools.com/practice/problems',
  'https://www.cipherschools.com/practice/problems/weekly',
  'https://www.cipherschools.com/practice/problems/topic/array',
  'https://www.cipherschools.com/practice/problems/topic/string',
  'https://www.cipherschools.com/practice/problems/topic/binary-search',
  'https://www.cipherschools.com/practice/problems/topic/linked-list',
  'https://www.cipherschools.com/practice/problems/topic/two-pointers',
  'https://www.cipherschools.com/practice/problems/topic/prefix-sum',
  'https://www.cipherschools.com/practice/problems/topic/sliding-window',
  'https://www.cipherschools.com/practice/problems/topic/stack',
  'https://www.cipherschools.com/practice/problems/topic/sorting',
  'https://www.cipherschools.com/practice/problems/topic/greedy',
  'https://www.cipherschools.com/practice/problems/topic/tree',
  'https://www.cipherschools.com/practice/problems/topic/singly-linked-list',
  'https://www.cipherschools.com/practice/problems/topic/hash-table',
  'https://www.cipherschools.com/practice/problems/topic/math',
  'https://www.cipherschools.com/practice/problems/topic/recursion',
  'https://www.cipherschools.com/practice/problems/topic/dynamic-programming',
  'https://www.cipherschools.com/practice/problems/topic/depth-first-search',
  'https://www.cipherschools.com/practice/problems/topic/binary-search-tree',
  'https://compiler.cipherschools.com'
];

test('Login and visit all sitemap URLs', async ({ page }) => {
  // Login
  await page.goto('https://www.cipherschools.com/');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('luffydmonkey6988420@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('Vishalch@1907'); //prod pass
  await page.getByRole('button', { name: 'Signin' }).click();

  const cookieBanner = page.locator('section').filter({ hasText: /Accept All|Reject All|Customise/i }).first();
  if (await cookieBanner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Accept All' }).click().catch(() => { });
  }

  // Visit each URL
  for (const url of urls) {
    // sanitize URL: strip markdown link syntax like [text](href)
    let href = url;
    const mdMatch = href.match(/^\[.*\]\((.*)\)$/);
    if (mdMatch) href = mdMatch[1];

    // validate URL
    try {
      const parsed = new URL(href);
      if (!/^https?:$/.test(parsed.protocol)) {
        console.warn(`Skipping non-http URL: ${href}`);
        continue;
      }
    } catch (e) {
      console.warn(`Invalid URL, skipping: ${href}`);
      continue;
    }

    console.log(`Visiting: ${href}`);
    try {
      await page.goto(href, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Navigation failed for ${href}: ${msg}`);
      continue;
    }

    // Wait 1 second on each page
    await page.waitForTimeout(1000);
  }
});