# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cipherschools\cipherschools.spec.js >> Verify dashboard page after login
- Location: tests\cipherschools\cipherschools.spec.js:35:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Your Display Name' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Your Display Name' })

```

```yaml
- img
- link "cipherschools-logo CipherSchools":
  - /url: /courses
  - img "cipherschools-logo"
  - heading "CipherSchools" [level=2]
- button "Guide Me"
- article:
  - searchbox "Search and Learn"
  - button:
    - img
- img
- text: "0"
- img "Monkey D Luffy"
- img "watchpoint-icon"
- heading "8.79K" [level=2]
- main:
  - complementary:
    - article:
      - list:
        - list:
          - button:
            - img
          - link "Home":
            - /url: /
            - img
            - text: Home
          - link "Courses":
            - /url: /courses
            - img
            - text: Courses
          - link "Batches":
            - /url: /batches
            - img
            - text: Batches
          - link "Premium":
            - /url: https://pro.cipherschools.com
            - img
            - text: Premium
          - link "CipherLabs":
            - /url: /practice
            - img
            - text: CipherLabs
          - link "Rewards":
            - /url: /rewards
            - img
            - text: Rewards
          - link "Dashboard":
            - /url: /profile
            - img
            - text: Dashboard
          - link "Compiler":
            - /url: https://compiler.cipherschools.com
            - img
            - text: Compiler
          - link "Resume":
            - /url: /resume-builder
            - img
            - text: Resume
          - button "Creator":
            - img
            - text: Creator
          - button "Feedback":
            - img
            - text: Feedback
      - listitem:
        - img
        - text: Logout
  - img "Monkey D Luffy"
  - heading "Monkey D Luffy" [level=1]
  - heading "luffydmonkey6988420@gmail.com" [level=2]
  - link "View public profile":
    - /url: /profile/luffydmonkey069211221
  - text: 0 Followers
  - link:
    - /url: https://qa.cipherschools.com/profile/me
  - link:
    - /url: https://qa.cipherschools.com/profile/me
  - link:
    - /url: https://qa.cipherschools.com/profile/me
  - main:
    - link:
      - /url: /profile/enrollments
      - article:
        - img "Enrolled Courses-icon"
        - heading "Enrolled Courses" [level=3]
        - text: "35"
    - link:
      - /url: /profile/enrollments?type=notcomplete
      - article:
        - img "Active Courses-icon"
        - heading "Active Courses" [level=3]
        - text: "32"
    - link:
      - /url: /profile/certificates
      - article:
        - img "My Certificates-icon"
        - heading "My Certificates" [level=3]
        - text: "3"
    - heading "Certificates & Badges" [level=1]
    - main:
      - article:
        - link:
          - /url: /certificate/preview?id=6a4f8548859a30fc58122549
        - figure:
          - img "badge-Technical Bootcamps by CipherSchools"
          - heading "Completion Badge" [level=4]
          - paragraph: Technical Bootcamps by CipherSchools
          - paragraph: 9 Jul 26
      - article:
        - link:
          - /url: /certificate/preview?id=6a1ee3178dcd09298f80c2c6
        - figure:
          - img "badge-Java - Full-Stack"
          - heading "Completion Badge" [level=4]
          - paragraph: Java - Full-Stack
          - paragraph: 2 Jun 26
      - article:
        - link:
          - /url: /certificate/preview?id=6a1ec8248dcd09298f80c2a1
        - figure:
          - img "certificate-DUMMY TITLE"
          - heading "Training certificate" [level=4]
          - paragraph: DUMMY TITLE
          - paragraph: 2 Jun 26
    - heading "My Progress" [level=1]
    - main:
      - article:
        - link:
          - /url: /batches/com45b83/contents
        - figure "unlisted":
          - img "Competitive Coding & Dynamic Programming Hybrid"
          - text: Unlisted
        - heading "Competitive Coding & Dynamic Programming Hybrid" [level=2]
        - paragraph:
          - paragraph: "Competitive programming is a mind sport involving students trying to program according to provided specifications or problems. Competitive programming is recognised and supported by several multinational software and Internet companies, such as Google, Facebook (Meta), Microsoft, Adobe, etc. In this program you will be learning and practicing Data Structures & Algorithms, will be getting exposed to Dynamic Programming. Please find the overview of the topics that would get covered in this playlist below, 1. Introduction and prerequisites – Control Flow, Mathematics, Getting Started 2. Complexity analysis- Time and Space- Theoretical analysis Tradeoff. 3. Recursion- Technicalities, Questions 4. Searching and Sorting Algorithms and Applications- Basics, Modifications, Questions 5. Backtracking- Theoretical Analysis, N-Queen, Other questions 6. Greedy Approach- Optimizations, General Problem, Greedy approach on arrays, OS, Graphs, approximations on NP Complete Problems 7. Bit masking and Modulo Arithmetic- Shift Operators, All bit wise operators, modulo, Questions 8. Adhoc Problems- Meaning, Live Problems 9. Dynamic Programming- States, DAG, Recursion Tree, Tabulation, Mnemonization, Optimal Substructure, Questions 10. Graphs- Basics, Cycle Algorithms, Sorting, MST, Backtracking in Graph, Shortest path, connectivity, Max Flow 11. Segment Tree- Build Update Query 12. Fenwick Tree- Implementation, benefit and code 13. Tries- Requirements and Introductory problems with implementation 14. Number Theory- GCD, LCM, Primes Modular arithmetic etc. 15. Game Theory- Problems about Combinational Game Theory, MinMax Algorithm and Problems Here is the github repo that you can refer while learning this program: https://github.com/Cipher-Schools/Competitive_Coding_Cpp"
        - paragraph
        - paragraph: 0% completed
      - article:
        - link:
          - /url: /batches/com0e162/contents
        - figure "unlisted":
          - img "Competitive Coding & Dynamic Programming Hybrid"
          - text: Unlisted
        - heading "Competitive Coding & Dynamic Programming Hybrid" [level=2]
        - paragraph:
          - paragraph: "Competitive programming is a mind sport involving students trying to program according to provided specifications or problems. Competitive programming is recognised and supported by several multinational software and Internet companies, such as Google, Facebook (Meta), Microsoft, Adobe, etc. In this program you will be learning and practicing Data Structures & Algorithms, will be getting exposed to Dynamic Programming. Please find the overview of the topics that would get covered in this playlist below, 1. Introduction and prerequisites – Control Flow, Mathematics, Getting Started 2. Complexity analysis- Time and Space- Theoretical analysis Tradeoff. 3. Recursion- Technicalities, Questions 4. Searching and Sorting Algorithms and Applications- Basics, Modifications, Questions 5. Backtracking- Theoretical Analysis, N-Queen, Other questions 6. Greedy Approach- Optimizations, General Problem, Greedy approach on arrays, OS, Graphs, approximations on NP Complete Problems 7. Bit masking and Modulo Arithmetic- Shift Operators, All bit wise operators, modulo, Questions 8. Adhoc Problems- Meaning, Live Problems 9. Dynamic Programming- States, DAG, Recursion Tree, Tabulation, Mnemonization, Optimal Substructure, Questions 10. Graphs- Basics, Cycle Algorithms, Sorting, MST, Backtracking in Graph, Shortest path, connectivity, Max Flow 11. Segment Tree- Build Update Query 12. Fenwick Tree- Implementation, benefit and code 13. Tries- Requirements and Introductory problems with implementation 14. Number Theory- GCD, LCM, Primes Modular arithmetic etc. 15. Game Theory- Problems about Combinational Game Theory, MinMax Algorithm and Problems Here is the github repo that you can refer while learning this program: https://github.com/Cipher-Schools/Competitive_Coding_Cpp"
        - paragraph
        - paragraph: 0% completed
      - article:
        - link:
          - /url: /courses/technical-bootcamps-workshops-by-cipherschools-788d/game-development-workshop-ft-adhiraj-788f
        - figure "public":
          - img "Technical Bootcamps & Workshops by CipherSchools"
        - heading "Technical Bootcamps & Workshops by CipherSchools" [level=2]
        - paragraph: Welcome to the CipherSchools Weekend Workshop playlist, where you can access exclusive and invaluable content from our highly acclaimed workshops. Designed to help you unleash your potential in the world of technology, programming, designing, product and lot's more this curated playlist offers a treasure trove of knowledge and practical insights shared by industry experts and instructors. Whether you missed out on attending our workshops in person or you want to revisit and reinforce the concepts covered, this collection of recorded sessions provides an immersive learning experience that you can access anytime, anywhere. Each recording captures the essence of our workshops, delivering high-quality content that can help you excel in the fast-paced and ever-evolving tech industry.
        - paragraph
        - paragraph: 100% completed
      - article:
        - link:
          - /url: /batches/newe3c4f/contents
        - figure "restricted":
          - img "NEW DUMMY COURSE PREMIUM"
          - text: Premium
        - heading "NEW DUMMY COURSE PREMIUM" [level=2]
        - paragraph:
          - paragraph: Hi [Name],
          - paragraph: Great news!
          - paragraph:
            - text: Congratulations on successfully completing the previous stage. You've now unlocked
            - strong: "[Stage Name]"
            - text: and are ready to continue your learning journey.
          - paragraph: In this stage, you'll build on what you've already learned through new lessons, practical exercises, and engaging challenges.
          - paragraph: Log in to your account and start your next stage whenever you're ready.
          - paragraph: We wish you continued success and look forward to seeing your progress.
          - paragraph: Happy Learning!
          - paragraph: Regards,
          - paragraph: The Learning Team
        - paragraph
        - paragraph: 72.73% completed
    - button "View More"
    - article:
      - article "Collapse"
      - list:
        - list:
          - link "Dashboard":
            - /url: /profile
            - img
            - text: Dashboard
          - link "Profile":
            - /url: /profile/me
            - img
            - text: Profile
          - link "Enrolled Courses":
            - /url: /profile/enrollments
            - img
            - text: Enrolled Courses
          - link "Certificates":
            - /url: /profile/certificates
            - img
            - text: Certificates
          - link "Wishlist":
            - /url: /profile/wishlist
            - img
            - text: Wishlist
          - link "Liked Videos":
            - /url: /profile/liked-videos
            - img
            - text: Liked Videos
- article:
  - heading "We value your privacy" [level=2]
  - paragraph:
    - text: We use cookies to enhance your browsing experience, serve personalised ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
    - link "Privacy Policy":
      - /url: https://www.cipherschools.com/privacy
    - text: .
- navigation:
  - button "Customise"
  - button "Reject All"
  - button "Accept All"
- alert: Monkey D Luffy
```

# Test source

```ts
  1   | // @ts-check
  2   | // tests/cipherschools/cipherschools.spec.js
  3   | //
  4   | // CipherSchools end-to-end test suite.
  5   | //
  6   | // ─── Configuration contract ────────────────────────────────────────────────
  7   | // No URLs, credentials, timeouts, or user data are hardcoded in this file.
  8   | // All values come from config/test.config.js which reads env vars injected
  9   | // by the backend's environmentService.buildProcessEnv().
  10  | //
  11  | // To switch environments, change the selection in the frontend dashboard —
  12  | // zero changes are needed here.
  13  | // ──────────────────────────────────────────────────────────────────────────
  14  | 
  15  | const { test, expect } = require('@playwright/test');
  16  | const { loginAs } = require('../../helpers/auth.helper');
  17  | const { BasePage } = require('../../pages/BasePage');
  18  | const { getFullSitemapUrls } = require('../../config/sitemap.config');
  19  | const config = require('../../config/test.config');
  20  | 
  21  | // ─── Suite 1: Title check ────────────────────────────────────────────────────
  22  | test('CipherSchools — verify page title', async ({ page }) => {
  23  |   await page.goto('/');
  24  |   await expect(page).toHaveTitle(/Best Free Programming Courses Online | Learning Platform for All/);
  25  | });
  26  | 
  27  | // ─── Suite 2: Login ──────────────────────────────────────────────────────────
  28  | test('Login with valid credentials', async ({ page }) => {
  29  |   await page.goto('/');
  30  |   await loginAs(page, config.credentials);
  31  |   await expect(page.getByText('Login Successful')).toBeVisible();
  32  | });
  33  | 
  34  | // ─── Suite 3: Dashboard ──────────────────────────────────────────────────────
  35  | test('Verify dashboard page after login', async ({ page }) => {
  36  |   await page.goto('/');
  37  |   await loginAs(page, config.credentials);
  38  | 
  39  |   // Navigate to profile / dashboard
  40  |   await page.getByRole('link', { name: 'Dashboard' }).click();
  41  |   await expect(page).toHaveURL('/profile');
  42  | 
  43  |   // Profile heading should show the configured display name
  44  |   await expect(
  45  |     page.getByRole('heading', { name: config.testData.displayName })
> 46  |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  47  | 
  48  |   // My Profile sub-page
  49  |   await page.locator('#ps-my-profile').click();
  50  |   await expect(page).toHaveURL('/profile/me');
  51  |   await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();
  52  | 
  53  |   // Enrolled Courses
  54  |   await page.getByRole('link', { name: 'Enrolled Courses' }).click();
  55  |   await expect(page).toHaveURL('/profile/enrollments?publicPage=1&restrictedPage=1');
  56  |   await expect(page.getByRole('heading', { name: 'Premium courses' })).toBeVisible();
  57  | 
  58  |   // Certificates
  59  |   await page.getByRole('link', { name: 'Certificates' }).click();
  60  |   await expect(page).toHaveURL('/profile/certificates');
  61  |   await expect(page.getByRole('heading', { name: 'Certificates & Badges' })).toBeVisible();
  62  | 
  63  |   // Wishlist
  64  |   await page.getByRole('link', { name: 'Wishlist' }).click();
  65  |   await expect(page).toHaveURL('/profile/wishlist');
  66  |   await expect(page.getByRole('heading', { name: 'Wishlist videos' })).toBeVisible();
  67  | 
  68  |   // Liked Videos
  69  |   await page.getByRole('link', { name: 'Liked Videos' }).click();
  70  |   await expect(page).toHaveURL('/profile/liked-videos');
  71  |   await expect(page.getByRole('heading', { name: 'Liked videos' })).toBeVisible();
  72  | });
  73  | 
  74  | // ─── Suite 4: Courses ────────────────────────────────────────────────────────
  75  | test('Verify courses page', async ({ page }) => {
  76  |   await page.goto('/');
  77  |   await loginAs(page, config.credentials);
  78  | 
  79  |   const basePage = new BasePage(page);
  80  |   await basePage.goToCourses();
  81  |   await expect(page).toHaveURL('/courses');
  82  |   await expect(page.getByRole('heading', { name: 'Recommended Courses' })).toBeVisible();
  83  | });
  84  | 
  85  | // ─── Suite 5: Batches ────────────────────────────────────────────────────────
  86  | test('Verify batches page', async ({ page }) => {
  87  |   await page.goto('/');
  88  |   await loginAs(page, config.credentials);
  89  | 
  90  |   const basePage = new BasePage(page);
  91  |   await basePage.goToBatches();
  92  |   await expect(page).toHaveURL('/batches');
  93  |   await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();
  94  | 
  95  |   // Open the test user's batch — slug comes from config, not hardcoded
  96  |   const batchSlug = config.testData.batchSlug;
  97  |   await page.locator(`#batches-${batchSlug}`).getByRole('link').filter({ hasText: /^$/ }).click();
  98  |   await expect(page).toHaveURL(`/batches/${batchSlug}`);
  99  |   await expect(page.getByRole('heading', { name: `Hey ${config.testData.displayName.split(' ')[0]}` })).toBeVisible();
  100 | 
  101 |   // Syllabus
  102 |   await basePage.goToSyllabus();
  103 |   await expect(page).toHaveURL(`/batches/${batchSlug}/syllabus`);
  104 |   await expect(page.getByRole('heading', { name: 'Syllabus' })).toBeVisible();
  105 | 
  106 |   // Lectures
  107 |   await page.getByRole('link', { name: 'Lectures' }).click();
  108 |   await expect(page).toHaveURL(`/batches/${batchSlug}/contents/${config.testData.contentId}`);
  109 |   await expect(page.getByRole('heading', { name: 'Lecture Stages' })).toBeVisible();
  110 | 
  111 |   // Calendar
  112 |   await page.getByRole('link', { name: 'Calendar' }).click();
  113 |   await expect(page).toHaveURL(`/batches/${batchSlug}/calendar`);
  114 |   await expect(page.getByRole('heading', { name: 'My Calendar' })).toBeVisible();
  115 | 
  116 |   // Practice
  117 |   await basePage.goToPractice();
  118 |   await expect(page).toHaveURL(`/batches/${batchSlug}/problems`);
  119 |   await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();
  120 | 
  121 |   // Practice sub-sections
  122 |   await page.locator('#tab-problems').click();
  123 |   await expect(page).toHaveURL(`/batches/${batchSlug}/problems?type=additional`);
  124 |   await expect(page.getByRole('columnheader', { name: 'PROBLEM' })).toBeVisible();
  125 | 
  126 |   await page.locator('#tab-assignments').click();
  127 |   await expect(page).toHaveURL(`/batches/${batchSlug}/problems?type=assignments`);
  128 |   await expect(page.getByPlaceholder('Search assignments...')).toBeVisible();
  129 | 
  130 |   // Tests
  131 |   await page.getByRole('link', { name: 'Tests' }).click();
  132 |   await expect(page).toHaveURL(`/batches/${batchSlug}/tests`);
  133 |   await expect(page.getByRole('heading', { name: 'Proctored Test' })).toBeVisible();
  134 | 
  135 |   // Projects
  136 |   await page.getByRole('link', { name: 'Projects' }).click();
  137 |   await expect(page).toHaveURL(`/batches/${batchSlug}/projects`);
  138 |   await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  139 | 
  140 |   // Resources
  141 |   await page.getByRole('link', { name: 'Resources' }).click();
  142 |   await expect(page).toHaveURL(`/batches/${batchSlug}/resources`);
  143 |   await expect(page.getByRole('heading', { name: 'Resources', exact: true })).toBeVisible();
  144 | 
  145 |   // Performance
  146 |   await page.getByRole('link', { name: 'Performance' }).click();
```