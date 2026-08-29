/**
 * Parse schedule string "08:00" or "daily at 8:00 AM" into hour/minute.
 * @param {string} text
 */
export function parseSchedule(text) {
  const s = String(text || '').trim();

  const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hour = parseInt(h24[1], 10);
    const minute = parseInt(h24[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
    return null;
  }

  const h12 = s.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (h12) {
    let hour = parseInt(h12[1], 10);
    const minute = h12[2] ? parseInt(h12[2], 10) : 0;
    const ampm = h12[3].toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return { hour, minute };
  }

  return null;
}

/**
 * Cron expression for daily run at hour:minute (local).
 * @param {number} hour
 * @param {number} minute
 */
export function toCronExpression(hour, minute) {
  return `${minute} ${hour} * * *`;
}

/**
 * Windows task name for a job.
 * @param {string} jobId
 */
export function taskNameForJob(jobId) {
  return `effortless-wa-${jobId}`;
}
