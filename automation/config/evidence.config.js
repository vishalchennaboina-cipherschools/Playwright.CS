/**
 * Configuration for the Enterprise Test Evidence Management System.
 * Developers should only update this file to configure evidence capture.
 */

module.exports = {
  // Capture screenshots: 'ALL', 'FAILURES_ONLY', or 'NONE'
  captureScreenshots: 'ALL',

  // Capture video recording of the test execution
  captureVideos: true,

  // Capture Playwright trace (includes DOM snapshots, network, console)
  captureTraces: true,

  // Capture human-readable test execution logs
  captureLogs: true,

  // Extract console.log, console.warn, console.error from traces
  captureConsole: true,

  // Extract failed network requests from traces
  captureNetwork: true,
};
