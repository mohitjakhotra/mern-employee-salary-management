import { describe, it, expect } from 'vitest';
import Overtime from '../OvertimeModel.js';

describe('OvertimeModel', () => {
    it('should have correct attributes', () => {
        const attributes = Overtime.rawAttributes;
        
        expect(attributes).toHaveProperty('id');
        expect(attributes).toHaveProperty('worker_id');
        expect(attributes).toHaveProperty('date');
        expect(attributes).toHaveProperty('hours');
        expect(attributes).toHaveProperty('reason');
        expect(attributes).toHaveProperty('createdAt');
        expect(attributes).toHaveProperty('updatedAt');
    });

    it('should have correct data types', () => {
        const attributes = Overtime.rawAttributes;
        
        expect(attributes.id.type.key).toBe('INTEGER');
        expect(attributes.worker_id.type.key).toBe('INTEGER');
        expect(attributes.date.type.key).toBe('DATEONLY');
        expect(attributes.hours.type.key).toBe('DECIMAL');
        expect(attributes.reason.type.key).toBe('STRING');
    });

    it('should enforce NOT NULL constraints', () => {
        const attributes = Overtime.rawAttributes;
        
        expect(attributes.worker_id.allowNull).toBe(false);
        expect(attributes.date.allowNull).toBe(false);
        expect(attributes.hours.allowNull).toBe(false);
        expect(attributes.reason.allowNull).toBe(false);
    });

    it('should have correct table name', () => {
        expect(Overtime.tableName).toBe('overtime');
    });
});
