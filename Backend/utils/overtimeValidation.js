import Overtime from '../models/OvertimeModel.js';
import DataPegawai from '../models/DataPegawaiModel.js';
import { Op, fn, col, where } from 'sequelize';

/**
 * Validates overtime input for required fields and business rules
 * @param {Object} input - The overtime entry data
 * @returns {Object} errors object (empty if valid)
 */
export const validateOvertimeInput = (input) => {
    const errors = {};
    const workerId = Number.parseInt(input.worker_id, 10);

    // Required field checks
    if (!Number.isInteger(workerId) || workerId <= 0) {
        errors.worker_id = 'Worker is required';
    }
    if (!input.date) {
        errors.date = 'Date is required';
    }
    if (input.hours === undefined || input.hours === null || input.hours === '') {
        errors.hours = 'Hours are required';
    }
    if (!input.reason || input.reason.trim() === '') {
        errors.reason = 'Reason is required';
    }

    // Field validation rules
    if (input.hours !== undefined && input.hours !== null && input.hours !== '') {
        const hours = parseFloat(input.hours);
        if (isNaN(hours) || hours < 1 || hours > 6) {
            errors.hours = 'Hours must be between 1 and 6';
        }
    }

    if (input.date) {
        const parsedDate = new Date(input.date);
        if (Number.isNaN(parsedDate.getTime())) {
            errors.date = 'Date is invalid';
            return errors;
        }

        const inputDate = new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate()
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (inputDate > today) {
            errors.date = 'Date cannot be in the future';
        } else if (inputDate < sevenDaysAgo) {
            errors.date = 'Date cannot be more than 7 days in the past';
        }
    }

    if (input.reason && input.reason.trim().length < 10) {
        errors.reason = 'Reason must be at least 10 characters';
    }

    return errors;
};

/**
 * Check if a duplicate entry exists for the same worker and date
 * @param {string} workerId - The worker ID
 * @param {Date|string} date - The date of the overtime entry
 * @returns {Promise<boolean>} true if duplicate exists
 */
export const checkDuplicate = async (workerId, date) => {
    try {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return false;

        const dateObj = new Date(parsedDate);
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

        const existing = await Overtime.findOne({
            where: {
                worker_id: workerId,
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        return !!existing;
    } catch (error) {
        console.error('Error checking for duplicate overtime entry:', error);
        throw error;
    }
};

/**
 * Get total overtime hours for a worker in a specific month
 * @param {string} workerId - The worker ID
 * @param {Date|string} date - Any date in the target month
 * @returns {Promise<number>} Total hours for the month
 */
export const getMonthlyTotal = async (workerId, date) => {
    try {
        const dateObj = new Date(date);
        if (Number.isNaN(dateObj.getTime())) return 0;

        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // getMonth() is 0-indexed

        const result = await Overtime.findAll({
            attributes: [
                [fn('SUM', col('hours')), 'totalHours']
            ],
            where: {
                worker_id: workerId,
                [Op.and]: [
                    where(fn('YEAR', col('date')), Op.eq, year),
                    where(fn('MONTH', col('date')), Op.eq, month)
                ]
            },
            raw: true
        });

        return parseFloat(result[0]?.totalHours) || 0;
    } catch (error) {
        console.error('Error calculating monthly total:', error);
        throw error;
    }
};

/**
 * Check if adding new hours would exceed the monthly cap of 60 hours
 * @param {string} workerId - The worker ID
 * @param {number} proposedHours - The hours to be added
 * @param {Date|string} date - The date of the proposed entry (for determining month)
 * @returns {Promise<boolean>} true if adding hours would exceed cap
 */
export const isMonthlyCapExceeded = async (workerId, proposedHours, date) => {
    try {
        const monthlyTotal = await getMonthlyTotal(workerId, date);
        const newTotal = monthlyTotal + parseFloat(proposedHours);
        return newTotal > 60;
    } catch (error) {
        console.error('Error checking monthly cap:', error);
        throw error;
    }
};

/**
 * Check if a worker exists in the system
 * @param {string} workerId - The worker ID
 * @returns {Promise<boolean>} true if worker exists
 */
export const workerExists = async (workerId) => {
    try {
        const normalizedWorkerId = Number.parseInt(workerId, 10);
        if (!Number.isInteger(normalizedWorkerId) || normalizedWorkerId <= 0) {
            return false;
        }

        const worker = await DataPegawai.findOne({
            where: {
                id: normalizedWorkerId
            }
        });
        return !!worker;
    } catch (error) {
        console.error('Error checking if worker exists:', error);
        throw error;
    }
};

/**
 * Perform all backend validations
 * @param {Object} input - The overtime entry data
 * @returns {Promise<{valid: boolean, errors: Object}>} Validation result
 */
export const performFullValidation = async (input) => {
    const errors = validateOvertimeInput(input);

    // If basic validation failed, return early
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }

    try {
        // Check if worker exists
        const exists = await workerExists(input.worker_id);
        if (!exists) {
            errors.worker_id = 'Worker not found in the system';
            return {
                valid: false,
                errors
            };
        }

        // Check for duplicates
        const isDuplicate = await checkDuplicate(input.worker_id, input.date);
        if (isDuplicate) {
            errors.date = 'An overtime entry already exists for this worker on this date';
        }

        // Check monthly cap
        const exceedsMonthly = await isMonthlyCapExceeded(
            input.worker_id,
            input.hours,
            input.date
        );
        if (exceedsMonthly) {
            errors.hours = 'Adding this overtime would exceed the 60-hour monthly limit';
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    } catch (error) {
        console.error('Error during full validation:', error);
        throw error;
    }
};
