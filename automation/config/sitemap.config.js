/**
 * @fileoverview Sitemap configuration.
 *
 * Stores sitemap paths as relative URLs only. The base URL is never hardcoded
 * here — it is resolved at runtime from `config.baseUrl` (which comes from
 * the BASE_URL environment variable injected by the backend).
 *
 * Usage in tests:
 *   const { getFullSitemapUrls } = require('../../config/sitemap.config');
 *   const urls = getFullSitemapUrls(); // fully qualified URLs for current env
 */

'use strict';

const config = require('./test.config');

/**
 * Relative sitemap paths for the main application.
 * These paths are appended to `config.baseUrl` at test runtime.
 *
 * To add or remove a URL, edit this array — NOT the test files.
 *
 * @type {string[]}
 */
const SITEMAP_PATHS = [
  '/',
  '/about-us',
  '/alumni',
  '/campus-invite',
  '/career-path',
  '/careers',
  '/contact',
  '/courses',
  '/courses/data-science',
  '/courses/data-structures',
  '/courses/game-development',
  '/courses/machine-learning',
  '/courses/others',
  '/courses/programming',
  '/courses/web-development',
  '/free-content-policy',
  '/privacy',
  '/rewards',
  '/resume-builder',
  '/support-us',
  '/terms-and-condition',
  '/trending-courses',
  '/videos',
  '/practice',
  '/practice/problems',
  '/practice/problems/weekly',
];

/**
 * Absolute URLs in the sitemap for URLs that have a fixed external base.
 * These are always visited as-is, regardless of the selected environment.
 * Only add URLs here that should NEVER be environment-swapped.
 *
 * @type {string[]}
 */
const EXTERNAL_SITEMAP_URLS = [
  'https://compiler.cipherschools.com',
];

/**
 * Build fully-qualified sitemap URLs for the currently configured environment.
 *
 * @returns {string[]} Array of absolute URLs to visit.
 */
function getFullSitemapUrls() {
  const base = config.baseUrl.replace(/\/$/, '');
  const relative = SITEMAP_PATHS.map((path) => `${base}${path}`);
  return [...relative, ...EXTERNAL_SITEMAP_URLS];
}

module.exports = {
  SITEMAP_PATHS,
  EXTERNAL_SITEMAP_URLS,
  getFullSitemapUrls,
};
