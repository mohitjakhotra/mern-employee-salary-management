import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createOvertime,
    getOvertimes,
    getOvertimeById
} from '../OvertimeController.js';
import Overtime from '../../models/OvertimeModel.js';
import * as validationUtils from '../../utils/overtimeValidation.js';

// Mock the dependencies
vi.mock('../../models/OvertimeModel.js');
vi.mock('../../utils/overtimeValidation.js');

describe('OvertimeController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            query: {},
            params: {}
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
    });

    describe('createOvertime', () => {
        it('should return 400 if validation fails', async () => {
            req.body = {
                worker_id: '',
                date: '2024-01-01',
                hours: 5,
                reason: 'Short'
            };

            vi.mocked(validationUtils.performFullValidation).mockResolvedValue({
                valid: false,
                errors: {
                    worker_id: 'Worker is required',
                    reason: 'Reason must be at least 10 characters'
                }
            });

            await createOvertime(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Validation failed',
                    errors: expect.objectContaining({
                        worker_id: 'Worker is required'
                    })
                })
            );
        });

        it('should create overtime entry if validation passes', async () => {
            const today = new Date().toISOString().split('T')[0];
            req.body = {
                worker_id: 123,
                date: today,
                hours: 5.5,
                reason: 'Project deadline work'
            };

            vi.mocked(validationUtils.performFullValidation).mockResolvedValue({
                valid: true,
                errors: {}
            });

            const mockOvertimeEntry = {
                id: 1,
                worker_id: 123,
                date: new Date(today),
                hours: 5.5,
                reason: 'Project deadline work',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            vi.mocked(Overtime.create).mockResolvedValue(mockOvertimeEntry);

            await createOvertime(req, res);

            expect(Overtime.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    worker_id: 123,
                    hours: 5.5,
                    reason: 'Project deadline work'
                })
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Overtime entry created successfully',
                    data: mockOvertimeEntry
                })
            );
        });

        it('should return 500 if database error occurs', async () => {
            req.body = {
                worker_id: 123,
                date: new Date().toISOString().split('T')[0],
                hours: 5,
                reason: 'Valid reason text'
            };

            vi.mocked(validationUtils.performFullValidation).mockResolvedValue({
                valid: true,
                errors: {}
            });

            vi.mocked(Overtime.create).mockRejectedValue(
                new Error('Database connection failed')
            );

            await createOvertime(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'An error occurred while creating the overtime entry'
                })
            );
        });

        it('should return 409 if duplicate constraint is hit at DB layer', async () => {
            req.body = {
                worker_id: 123,
                date: new Date().toISOString().split('T')[0],
                hours: 5,
                reason: 'Valid reason text'
            };

            vi.mocked(validationUtils.performFullValidation).mockResolvedValue({
                valid: true,
                errors: {}
            });

            vi.mocked(Overtime.create).mockRejectedValue({
                name: 'SequelizeUniqueConstraintError',
                original: { code: 'ER_DUP_ENTRY' }
            });

            await createOvertime(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'An overtime entry already exists for this worker on this date',
                    errors: expect.objectContaining({
                        date: 'An overtime entry already exists for this worker on this date'
                    })
                })
            );
        });
    });

    describe('getOvertimes', () => {
        it('should return list of overtimes with pagination', async () => {
            req.query = { limit: 10, offset: 0 };

            const mockOvertimes = [
                { id: 1, worker_id: 'worker-1', hours: 5 },
                { id: 2, worker_id: 'worker-2', hours: 4 }
            ];

            vi.mocked(Overtime.findAndCountAll).mockResolvedValue({
                count: 2,
                rows: mockOvertimes
            });

            await getOvertimes(req, res);

            expect(Overtime.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 10,
                    offset: 0,
                    where: {}
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockOvertimes,
                    pagination: expect.objectContaining({
                        total: 2,
                        limit: 10,
                        offset: 0
                    })
                })
            );
        });

        it('should filter by worker_id if provided', async () => {
            req.query = { limit: 10, offset: 0, worker_id: '123' };

            vi.mocked(Overtime.findAndCountAll).mockResolvedValue({
                count: 1,
                rows: [{ id: 1, worker_id: 123, hours: 5 }]
            });

            await getOvertimes(req, res);

            expect(Overtime.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { worker_id: 123 }
                })
            );
        });

        it('should return 500 if database error occurs', async () => {
            req.query = { limit: 10, offset: 0 };

            vi.mocked(Overtime.findAndCountAll).mockRejectedValue(
                new Error('Database connection failed')
            );

            await getOvertimes(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'An error occurred while fetching overtime entries'
                })
            );
        });
    });

    describe('getOvertimeById', () => {
        it('should return overtime entry if found', async () => {
            req.params = { id: 1 };

            const mockOvertime = {
                id: 1,
                worker_id: 123,
                hours: 5.5,
                date: new Date(),
                reason: 'Project deadline'
            };

            vi.mocked(Overtime.findOne).mockResolvedValue(mockOvertime);

            await getOvertimeById(req, res);

            expect(Overtime.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 }
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockOvertime
                })
            );
        });

        it('should return 404 if overtime entry not found', async () => {
            req.params = { id: 999 };

            vi.mocked(Overtime.findOne).mockResolvedValue(null);

            await getOvertimeById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Overtime entry not found'
                })
            );
        });

        it('should return 500 if database error occurs', async () => {
            req.params = { id: 1 };

            vi.mocked(Overtime.findOne).mockRejectedValue(
                new Error('Database connection failed')
            );

            await getOvertimeById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'An error occurred while fetching the overtime entry'
                })
            );
        });
    });
});
