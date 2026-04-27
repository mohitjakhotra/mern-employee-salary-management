import express from 'express';
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';
import {
    createOvertime,
    getOvertimes,
    getOvertimeById
} from '../controllers/OvertimeController.js';

const router = express.Router();

/**
 * POST /api/overtime
 * Create a new overtime entry
 * Requires authentication
 * Body: { worker_id, date, hours, reason }
 */
router.post('/api/overtime', verifyUser, adminOnly, createOvertime);

/**
 * GET /api/overtime
 * Get all overtime entries with optional pagination and filtering
 * Requires authentication
 * Query params: limit (default 10), offset (default 0), worker_id (optional)
 */
router.get('/api/overtime', verifyUser, adminOnly, getOvertimes);

/**
 * GET /api/overtime/:id
 * Get a single overtime entry by ID
 * Requires authentication
 * URL params: id
 */
router.get('/api/overtime/:id', verifyUser, adminOnly, getOvertimeById);

export default router;
