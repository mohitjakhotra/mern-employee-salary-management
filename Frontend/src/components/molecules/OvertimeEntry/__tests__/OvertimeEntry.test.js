import test from 'node:test';
import assert from 'node:assert/strict';

import { buildOvertimePayload } from '../payload.js';

test('buildOvertimePayload normalizes numeric values and trims reason', () => {
  const payload = buildOvertimePayload({
    worker_id: '42',
    date: '2026-04-26',
    hours: '2.5',
    reason: '  End-of-month payroll support  '
  });

  assert.deepEqual(payload, {
    worker_id: 42,
    date: '2026-04-26',
    hours: 2.5,
    reason: 'End-of-month payroll support'
  });
});
