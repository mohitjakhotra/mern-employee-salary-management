import test from 'node:test';
import assert from 'node:assert/strict';

import overtimeReducer from '../index.js';
import {
  CREATE_DATA_OVERTIME_FAILURE,
  CREATE_DATA_OVERTIME_SUCCESS,
  GET_DATA_OVERTIME_SUCCESS,
  CLEAR_OVERTIME_FEEDBACK
} from '../../../action/overtimeAction/overtimeActionTypes/index.js';

test('GET_DATA_OVERTIME_SUCCESS stores rows and pagination', () => {
  const action = {
    type: GET_DATA_OVERTIME_SUCCESS,
    payload: {
      data: [{ id: 1, worker_id: 1 }],
      pagination: { total: 1, limit: 10, offset: 0, pages: 1 }
    }
  };

  const next = overtimeReducer(undefined, action);

  assert.equal(next.loading, false);
  assert.equal(next.dataOvertime.length, 1);
  assert.equal(next.pagination.total, 1);
});

test('CREATE_DATA_OVERTIME_SUCCESS stores success message and clears validation errors', () => {
  const action = {
    type: CREATE_DATA_OVERTIME_SUCCESS,
    payload: { message: 'Saved' }
  };

  const next = overtimeReducer(undefined, action);

  assert.equal(next.message, 'Saved');
  assert.equal(next.error, null);
  assert.deepEqual(next.validationErrors, {});
});

test('CREATE_DATA_OVERTIME_FAILURE stores backend validation errors', () => {
  const action = {
    type: CREATE_DATA_OVERTIME_FAILURE,
    payload: {
      message: 'Validation failed',
      errors: { hours: 'Hours must be between 1 and 6' }
    }
  };

  const next = overtimeReducer(undefined, action);

  assert.equal(next.error, 'Validation failed');
  assert.equal(next.validationErrors.hours, 'Hours must be between 1 and 6');
});

test('CLEAR_OVERTIME_FEEDBACK resets message, error, and validation errors', () => {
  const state = {
    ...overtimeReducer(undefined, { type: '@@INIT' }),
    message: 'Saved',
    error: 'Some error',
    validationErrors: { date: 'Invalid date' }
  };

  const next = overtimeReducer(state, { type: CLEAR_OVERTIME_FEEDBACK });

  assert.equal(next.message, '');
  assert.equal(next.error, null);
  assert.deepEqual(next.validationErrors, {});
});
