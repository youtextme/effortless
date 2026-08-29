/**
 * Count non-overlapping occurrences of needle in haystack.
 * @param {string} haystack
 * @param {string} needle
 */
export function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let pos = 0;
  while (true) {
    const idx = haystack.indexOf(needle, pos);
    if (idx === -1) break;
    count += 1;
    pos = idx + needle.length;
  }
  return count;
}

/**
 * Decide if a send was verified based on occurrence delta and composer state.
 * @param {{ beforeCount: number, afterCount: number, composerText: string }} state
 */
export function isSendVerified({ beforeCount, afterCount, composerText }) {
  const delta = afterCount - beforeCount;
  const composerCleared = !composerText || composerText.trim() === '';
  return delta >= 1 && composerCleared;
}
