import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toCronExpression, taskNameForJob } from '../schedule/plan.js';

describe('schedule plan helpers', () => {
  it('builds cron expression', () => {
    assert.equal(toCronExpression(8, 0), '0 8 * * *');
    assert.equal(toCronExpression(20, 30), '30 20 * * *');
  });

  it('builds task name', () => {
    assert.equal(taskNameForJob('sigma-boy-morning'), 'effortless-wa-sigma-boy-morning');
  });
});
