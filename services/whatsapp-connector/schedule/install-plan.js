import { loadJobsFile } from '../lib/jobs.js';
import { parseSchedule, toCronExpression, taskNameForJob } from './plan.js';

/**
 * Build scheduler install plan for all enabled jobs.
 * @param {object[]} [jobs] - optional pre-loaded jobs
 */
export async function buildSchedulePlan(jobs) {
  if (!jobs) {
    const data = await loadJobsFile();
    jobs = data.jobs;
  }

  const plan = [];
  const errors = [];

  for (const job of jobs) {
    if (job.enabled === false) continue;
    const time = parseSchedule(job.schedule);
    if (!time) {
      errors.push(`Job "${job.id}": invalid schedule "${job.schedule}"`);
      continue;
    }
    plan.push({
      jobId: job.id,
      hour: time.hour,
      minute: time.minute,
      cron: toCronExpression(time.hour, time.minute),
      taskName: taskNameForJob(job.id),
      schedule: job.schedule,
    });
  }

  return { plan, errors };
}
