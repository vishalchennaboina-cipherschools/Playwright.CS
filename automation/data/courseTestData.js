'use strict';

/**
 * @fileoverview Enterprise Course Test Data
 *
 * Contains all reusable constants, URLs, keywords, categories, and expected
 * labels needed by the Courses automation module.
 *
 * Rules:
 *   - NEVER hardcode these values inside tests, pages, or services.
 *   - Import from this module instead.
 *   - Keep data alphabetically grouped for easy maintenance.
 */

module.exports = Object.freeze({

  // ─── URLs ──────────────────────────────────────────────────────────────────
  urls: Object.freeze({
    coursesPage: '/courses',
    appDevelopment: '/courses/app-development',
    webDevelopment: '/courses/web-development',
    gameDevelopment: '/courses/game-development',
    dataStructures: '/courses/data-structures',
    programming: '/courses/programming',
    machineLearning: '/courses/machine-learning',
    dataScience: '/courses/data-science',
    others: '/courses/others',
    cipherSchoolsProfile: '/profile/cipherschools',
  }),

  // ─── Verified CipherSchools Courses ────────────────────────────────────────
  // These are authored by CipherSchools (instructor logo → /profile/cipherschools).
  verifiedCourses: Object.freeze([
    {
      name: 'Machine Learning Beginner Friendly',
      url: '/courses/machine-learning-beginner-friendly-c841/class-1-git-and-git-hub-c842',
      category: 'machine-learning',
    },
    {
      name: 'Database Management System',
      url: '/courses/database-management-system-654d/lecture0-introduction-to-dbms-69e8',
      category: 'data-structures',
    },
    {
      name: 'Java and Data Structures Algorithm Program Hybrid',
      url: '/courses/java-and-data-structures-algorithm-program-hybrid-b55f/lecture-0-day-0-introduction-java-and-dsa-b560',
      category: 'programming',
    },
    {
      name: 'Cyber Security Fundamentals',
      url: '/courses/cyber-security-fundamentals-core-concepts-and-practices-75f4/lecture-1-introduction-to-cyber-security-part-1-ba3c',
      category: 'others',
    },
    {
      name: 'Python Programming Language Zero to Hero',
      url: '/courses/python-programming-language-zero-to-hero-beginner-friendly-01da/class-1-introduction-and-overview-infitiq-overview-basic-data-types-106b',
      category: 'programming',
    },
    {
      name: 'Competitive Coding using C++ for Interview Prep',
      url: '/courses/competitive-coding-using-c-for-interview-prep-0c5e/intro-and-overview-of-the-course-0e41',
      category: 'programming',
    },
    {
      name: 'React JS Bootcamp for Interview/Placement Preparation',
      url: '/courses/react-js-bootcamp-for-interviewplacement-preparation-0c5d/instructors-introduction-course-overview-c42c',
      category: 'web-development',
    },
  ]),

  // ─── Verified Standalone Videos ────────────────────────────────────────────
  verifiedVideos: Object.freeze([
    {
      name: 'Linear Regression Basics',
      url: '/videos/linear-regression-basics-with-example-by-kanav-machine-learning-dd90',
    },
    {
      name: 'What Exactly is MERN Stack',
      url: '/videos/what-exactly-is-mern-stack-with-project-example-by-palash-dd8f',
    },
    {
      name: 'How to Use Google with Full Potential',
      url: '/videos/how-to-use-google-with-its-full-potential-by-muthu-annamalai-9191',
    },
  ]),

  // ─── Search Keywords ───────────────────────────────────────────────────────
  search: Object.freeze({
    valid: 'Python',
    partial: 'Jav',
    invalid: 'xyznonexistentcourse12345',
    empty: '',
  }),

  // ─── Categories ────────────────────────────────────────────────────────────
  categories: Object.freeze([
    { name: 'App Development',  slug: 'app-development',  heading: 'app development' },
    { name: 'Web Development',  slug: 'web-development',  heading: 'web development' },
    { name: 'Game Development', slug: 'game-development', heading: 'game development' },
    { name: 'Data Structures',  slug: 'data-structures',  heading: 'data structures' },
    { name: 'Programming',      slug: 'programming',      heading: 'programming' },
    { name: 'Machine Learning', slug: 'machine-learning', heading: 'machine learning' },
    { name: 'Data Science',     slug: 'data-science',     heading: 'data science' },
    { name: 'Others',           slug: 'others',           heading: 'others' },
  ]),

  // ─── Expected Page Sections ────────────────────────────────────────────────
  pageSections: Object.freeze([
    'Recommended Courses',
    'Latest Courses',
    'Courses from people you follow',
    'Latest Videos',
    'All Courses',
  ]),

  // ─── Course Detail Tabs ────────────────────────────────────────────────────
  courseTabs: Object.freeze({
    videoList: '#video-list',
    comments: '#comments',
    notes: '#notes',
  }),

  // ─── Button / Label Names ─────────────────────────────────────────────────
  buttons: Object.freeze({
    like: 'Like',
    save: 'Save',
    share: 'Share',
    follow: 'Follow',
    following: 'Following',
    enrollNow: 'Enroll Now',
    enrolled: 'Enrolled',
    continueToEnroll: 'Continue to Enroll',
    badge: 'Badge',
    getLink: 'Get Link',
  }),

  // ─── Selectors (IDs used on the course detail page) ────────────────────────
  selectors: Object.freeze({
    likeBtn: '#vd_Like_Btn',
    saveBtn: '#vd_Save_Btn',
    shareGetLink: '#vd_Share_Get\\ Link',
    categoryRightArrow: '#Ctg_Right_Arrow',
  }),

  // ─── Onboarding / Enrollment Wizard Steps ──────────────────────────────────
  enrollmentWizardSteps: Object.freeze([
    'Unlock Your Badge!',
    'Learn Step by Step!',
    'Engage & Share Your Thoughts!',
    'Take & Download Notes!',
  ]),
});
