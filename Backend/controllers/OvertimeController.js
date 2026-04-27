import Overtime from '../models/OvertimeModel.js';
import {
    performFullValidation
} from '../utils/overtimeValidation.js';

/**
 * Create a new overtime entry
 * Validates all business rules before persisting
 */
export const createOvertime = async (req, res) => {
    try {
        const { worker_id, date, hours, reason } = req.body;
        const normalizedWorkerId = Number.parseInt(worker_id, 10);
        const normalizedHours = Number.parseFloat(hours);

        // Perform comprehensive validation
        const validationResult = await performFullValidation({
            worker_id,
            date,
            hours,
            reason
        });

        if (!validationResult.valid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.errors
            });
        }

        // Create the overtime entry
        const overtimeEntry = await Overtime.create({
            worker_id: normalizedWorkerId,
            date,
            hours: normalizedHours,
            reason: reason.trim()
        });

        return res.status(201).json({
            success: true,
            message: 'Overtime entry created successfully',
            data: overtimeEntry
        });
    } catch (error) {
        // Race-safe duplicate handling: the DB unique key is the final source of truth.
        if (error?.name === 'SequelizeUniqueConstraintError' || error?.original?.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'An overtime entry already exists for this worker on this date',
                errors: {
                    date: 'An overtime entry already exists for this worker on this date'
                }
            });
        }

        console.error('Error creating overtime entry:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the overtime entry'
        });
    }
};

/**
 * Get all overtime entries with optional pagination and filtering
 */
export const getOvertimes = async (req, res) => {
    try {
        const parsedLimit = Number.parseInt(req.query.limit, 10);
        const parsedOffset = Number.parseInt(req.query.offset, 10);
        const limit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 10;
        const offset = Number.isInteger(parsedOffset) ? Math.max(parsedOffset, 0) : 0;
        const parsedWorkerId = Number.parseInt(req.query.worker_id, 10);

        const where = {};
        if (Number.isInteger(parsedWorkerId) && parsedWorkerId > 0) {
            where.worker_id = parsedWorkerId;
        }

        const { count, rows } = await Overtime.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            raw: true
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                limit,
                offset,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching overtime entries:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching overtime entries'
        });
    }
};

/**
 * Get a single overtime entry by ID
 */
export const getOvertimeById = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = Number.parseInt(id, 10);
        if (!Number.isInteger(parsedId) || parsedId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid overtime id'
            });
        }

        const overtimeEntry = await Overtime.findOne({
            where: { id: parsedId },
            raw: true
        });

        if (!overtimeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Overtime entry not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: overtimeEntry
        });
    } catch (error) {
        console.error('Error fetching overtime entry:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the overtime entry'
        });
    }
};
