import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getTodayString,
  getSevenDaysAgoString,
  validateOvertimeInput
} from '../overtimeValidation.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

test('getTodayString returns local YYYY-MM-DD format', () => {
  const today = getTodayString();
  assert.match(today, DATE_RE);
});

test('getSevenDaysAgoString returns local YYYY-MM-DD format', () => {
  const sevenDaysAgo = getSevenDaysAgoString();
  assert.match(sevenDaysAgo, DATE_RE);
});

test('validateOvertimeInput accepts valid data', () => {
  const data = {
    worker_id: '1',
    date: getTodayString(),
    hours: '2.5',
    reason: 'Working on monthly closing tasks'
  };

  assert.deepEqual(validateOvertimeInput(data), {});
});

test('validateOvertimeInput rejects out of range hours', () => {
  const data = {
    worker_id: '1',
    date: getTodayString(),
    hours: '7',
    reason: 'Working on monthly closing tasks'
  };

  const errors = validateOvertimeInput(data);
  assert.equal(errors.hours, 'Hours must be between 1 and 6');
});

test('validateOvertimeInput rejects missing reason', () => {
  const data = {
    worker_id: '1',
    date: getTodayString(),
    hours: '2'
  };

  const errors = validateOvertimeInput(data);
  assert.equal(errors.reason, 'Reason is required');
});
