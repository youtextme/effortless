/**
 * WordSpark bootstrap — thin entry; all logic in platform/shell.js
 */
import { bootShell } from '../platform/shell.js';

document.addEventListener('DOMContentLoaded', () => {
  bootShell().catch((err) => {
    console.error('[WordSpark] shell boot failed', err);
  });
});
