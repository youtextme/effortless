import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateJob, validateJobsFile } from '../lib/jobs.js';
import { parseSchedule } from '../schedule/plan.js';
import { buildSchedulePlan } from '../schedule/install-plan.js';

describe('validateJob', () => {
  const valid = {
    id: 'sigma-boy-morning',
    to: 'Sigma Boy',
    schedule: '08:00',
    prompt: 'Write something nice.',
  };

  it('accepts valid job', () => {
    assert.equal(validateJob(valid), null);
  });

  it('accepts phone instead of to', () => {
    assert.equal(validateJob({ ...valid, to: undefined, phone: '+15551234567' }), null);
  });

  it('rejects missing destination', () => {
    assert.match(validateJob({ ...valid, to: undefined }), /to.*phone/i);
  });

  it('rejects both to and phone', () => {
    assert.match(validateJob({ ...valid, phone: '123' }), /not both/i);
  });

  it('rejects bad id', () => {
    assert.match(validateJob({ ...valid, id: 'Bad ID!' }), /id/i);
  });

  it('rejects bad schedule', () => {
    assert.match(validateJob({ ...valid, schedule: 'noon' }), /schedule/i);
  });
});

describe('validateJobsFile', () => {
  it('rejects duplicate ids', () => {
    const err = validateJobsFile({
      jobs: [
        { id: 'a', to: 'X', schedule: '08:00', prompt: 'p' },
        { id: 'a', to: 'Y', schedule: '09:00', prompt: 'p' },
      ],
    });
    assert.match(err, /duplicate/i);
  });
});

describe('parseSchedule', () => {
  it('parses 08:00', () => {
    assert.deepEqual(parseSchedule('08:00'), { hour: 8, minute: 0 });
  });

  it('parses 20:30', () => {
    assert.deepEqual(parseSchedule('20:30'), { hour: 20, minute: 30 });
  });
});

describe('buildSchedulePlan', () => {
  it('builds plan for enabled jobs only', async () => {
    const jobs = [
      { id: 'on', enabled: true, schedule: '08:00', to: 'A', prompt: 'p' },
      { id: 'off', enabled: false, schedule: '09:00', to: 'B', prompt: 'p' },
    ];
    const { plan, errors } = await buildSchedulePlan(jobs);
    assert.equal(errors.length, 0);
    assert.equal(plan.length, 1);
    assert.equal(plan[0].jobId, 'on');
    assert.equal(plan[0].cron, '0 8 * * *');
    assert.equal(plan[0].taskName, 'effortless-wa-on');
  });

  it('reports invalid schedules', async () => {
    const jobs = [{ id: 'bad', enabled: true, schedule: 'sometime', to: 'A', prompt: 'p' }];
    const { plan, errors } = await buildSchedulePlan(jobs);
    assert.equal(plan.length, 0);
    assert.equal(errors.length, 1);
  });
});
