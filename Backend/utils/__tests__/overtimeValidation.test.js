import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../models/OvertimeModel.js', () => ({
    default: {
        findOne: vi.fn(),
        findAll: vi.fn()
    }
}));

vi.mock('../../models/DataPegawaiModel.js', () => ({
    default: {
        findOne: vi.fn()
    }
}));

import Overtime from '../../models/OvertimeModel.js';
import DataPegawai from '../../models/DataPegawaiModel.js';
import {
    validateOvertimeInput,
    checkDuplicate,
    getMonthlyTotal,
    isMonthlyCapExceeded,
    workerExists,
    performFullValidation
} from '../overtimeValidation.js';

describe('Overtime Validation Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateOvertimeInput', () => {
        it('returns empty errors for valid input', () => {
            const today = new Date().toISOString().split('T')[0];
            const input = {
                worker_id: 1,
                date: today,
                hours: 5.5,
                reason: 'Project deadline work'
            };

            expect(validateOvertimeInput(input)).toEqual({});
        });

        it('rejects invalid worker id', () => {
            const today = new Date().toISOString().split('T')[0];
            const errors = validateOvertimeInput({
                worker_id: 'abc',
                date: today,
                hours: 5,
                reason: 'Project deadline work'
            });

            expect(errors.worker_id).toBe('Worker is required');
        });

        it('keeps required error for empty hours', () => {
            const today = new Date().toISOString().split('T')[0];
            const errors = validateOvertimeInput({
                worker_id: 1,
                date: today,
                hours: '',
                reason: 'Project deadline work'
            });

            expect(errors.hours).toBe('Hours are required');
        });

        it('rejects invalid date strings', () => {
            const errors = validateOvertimeInput({
                worker_id: 1,
                date: 'not-a-date',
                hours: 5,
                reason: 'Project deadline work'
            });

            expect(errors.date).toBe('Date is invalid');
        });

        it('rejects hours outside 1-6 range', () => {
            const today = new Date().toISOString().split('T')[0];
            const errors = validateOvertimeInput({
                worker_id: 1,
                date: today,
                hours: 7,
                reason: 'Project deadline work'
            });

            expect(errors.hours).toBe('Hours must be between 1 and 6');
        });
    });

    describe('checkDuplicate', () => {
        it('returns true when existing row is found', async () => {
            Overtime.findOne.mockResolvedValue({ id: 10 });

            const result = await checkDuplicate(1, '2026-04-20');

            expect(result).toBe(true);
            expect(Overtime.findOne).toHaveBeenCalledTimes(1);
        });

        it('returns false for invalid date input', async () => {
            const result = await checkDuplicate(1, 'invalid-date');

            expect(result).toBe(false);
            expect(Overtime.findOne).not.toHaveBeenCalled();
        });
    });

    describe('getMonthlyTotal', () => {
        it('returns monthly sum when rows exist', async () => {
            Overtime.findAll.mockResolvedValue([{ totalHours: '12.5' }]);

            const result = await getMonthlyTotal(1, '2026-04-20');

            expect(result).toBe(12.5);
            expect(Overtime.findAll).toHaveBeenCalledTimes(1);
        });

        it('returns 0 for invalid date input', async () => {
            const result = await getMonthlyTotal(1, 'bad-date');

            expect(result).toBe(0);
            expect(Overtime.findAll).not.toHaveBeenCalled();
        });
    });

    describe('isMonthlyCapExceeded', () => {
        it('returns true when proposed total exceeds 60', async () => {
            Overtime.findAll.mockResolvedValue([{ totalHours: '58' }]);

            const result = await isMonthlyCapExceeded(1, 3, '2026-04-20');

            expect(result).toBe(true);
        });

        it('returns false when proposed total stays within cap', async () => {
            Overtime.findAll.mockResolvedValue([{ totalHours: '52' }]);

            const result = await isMonthlyCapExceeded(1, 3, '2026-04-20');

            expect(result).toBe(false);
        });
    });

    describe('workerExists', () => {
        it('returns false for invalid worker id', async () => {
            const result = await workerExists('abc');

            expect(result).toBe(false);
            expect(DataPegawai.findOne).not.toHaveBeenCalled();
        });

        it('returns true when worker exists', async () => {
            DataPegawai.findOne.mockResolvedValue({ id: 1 });

            const result = await workerExists(1);

            expect(result).toBe(true);
            expect(DataPegawai.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe('performFullValidation', () => {
        it('returns early when basic validation fails', async () => {
            const result = await performFullValidation({
                worker_id: 1,
                hours: 2,
                reason: 'Valid reason text'
            });

            expect(result.valid).toBe(false);
            expect(result.errors.date).toBe('Date is required');
            expect(DataPegawai.findOne).not.toHaveBeenCalled();
        });

        it('returns worker not found error and stops extra checks', async () => {
            DataPegawai.findOne.mockResolvedValue(null);

            const result = await performFullValidation({
                worker_id: 99,
                date: '2026-04-20',
                hours: 2,
                reason: 'Valid reason text'
            });

            expect(result.valid).toBe(false);
            expect(result.errors.worker_id).toBe('Worker not found in the system');
            expect(Overtime.findOne).not.toHaveBeenCalled();
            expect(Overtime.findAll).not.toHaveBeenCalled();
        });
    });
});
