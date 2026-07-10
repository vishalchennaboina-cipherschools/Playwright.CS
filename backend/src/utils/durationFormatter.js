/**
 * @fileoverview Duration formatting utility.
 *
 * Converts raw seconds into human-readable strings that match
 * the frontend's `formatDuration()` output.
 *
 * @module utils/durationFormatter
 */

/**
 * Format seconds into a human-readable duration string.
 *
 * @param {number} totalSeconds - Duration in seconds.
 * @returns {string} e.g. "2m 22s", "1h 12m", "45s".
 */
function formatDuration(totalSeconds) {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) return '0s';

  const seconds = Math.round(totalSeconds);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Calculate duration in seconds between two timestamps.
 *
 * @param {string|Date|number} startedAt - Start time.
 * @param {string|Date|number} [endedAt] - End time (defaults to now).
 * @returns {number} Duration in seconds.
 */
function calcDuration(startedAt, endedAt) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  return Math.max(0, Math.round((end - start) / 1000));
}

module.exports = { formatDuration, calcDuration };
