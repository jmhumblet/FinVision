import { describe, test, expect } from 'vitest';
import { calculateMergeChanges } from '../scenarioUtils';
import { Projection, Scenario, AdjustmentType, Frequency, TransactionType } from '../../types';

describe('calculateMergeChanges', () => {
    const baseProj: Projection = {
        id: 'proj1',
        name: 'Rent',
        amount: 2000,
        frequency: Frequency.MONTHLY,
        startDate: '2024-01-01',
        categoryId: '1',
        type: TransactionType.EXPENSE,
        isActive: true
    };

    const baseScenario: Scenario = {
        id: 'scen1',
        name: 'Test Scenario',
        color: 'red',
        isActive: true,
        adjustments: []
    };

    test('should add new projections', () => {
        const newProj: Projection = { ...baseProj, id: 'new1', name: 'New Item' };
        const scenario = { ...baseScenario, newProjections: [newProj] };

        const result = calculateMergeChanges([baseProj], scenario);

        expect(result.toAdd).toHaveLength(1);
        expect(result.toAdd[0]).toEqual(newProj);
        expect(result.toUpdate).toHaveLength(0);
        expect(result.toDelete).toHaveLength(0);
    });

    test('should handle simple amount update (immediate start)', () => {
        const scenario: Scenario = {
            ...baseScenario,
            adjustments: [{
                id: 'adj1',
                projectionId: 'proj1',
                type: AdjustmentType.PERCENTAGE_INCREASE,
                value: 10
            }]
        };

        const result = calculateMergeChanges([baseProj], scenario);

        expect(result.toUpdate).toHaveLength(1);
        expect(result.toUpdate[0].amount).toBe(2200);
        expect(result.toUpdate[0].startDate).toBe('2024-01-01');
        expect(result.toAdd).toHaveLength(0);
    });

    test('should handle delete (remove record)', () => {
        const scenario: Scenario = {
            ...baseScenario,
            adjustments: [{
                id: 'adj1',
                projectionId: 'proj1',
                type: AdjustmentType.REMOVE_RECORD,
                value: 0
            }]
        };

        const result = calculateMergeChanges([baseProj], scenario);

        expect(result.toDelete).toContain('proj1');
        expect(result.toUpdate).toHaveLength(0);
    });

    test('should handle future start (split projection)', () => {
        const scenario: Scenario = {
            ...baseScenario,
            adjustments: [{
                id: 'adj1',
                projectionId: 'proj1',
                type: AdjustmentType.SET_AMOUNT,
                value: 2500,
                startDate: '2024-02-01'
            }]
        };

        const result = calculateMergeChanges([baseProj], scenario);

        // Should update original to end 2024-01-31
        expect(result.toUpdate).toHaveLength(1);
        expect(result.toUpdate[0].id).toBe('proj1');
        expect(result.toUpdate[0].endDate).toBe('2024-01-31');

        // Should add new projection starting 2024-02-01
        expect(result.toAdd).toHaveLength(1);
        expect(result.toAdd[0].startDate).toBe('2024-02-01');
        expect(result.toAdd[0].amount).toBe(2500);
        expect(result.toAdd[0].endDate).toBeUndefined();
    });

    test('should handle temporary change (immediate start with end date)', () => {
        const scenario: Scenario = {
            ...baseScenario,
            adjustments: [{
                id: 'adj1',
                projectionId: 'proj1',
                type: AdjustmentType.ADD_AMOUNT,
                value: 500,
                endDate: '2024-03-31'
            }]
        };

        const result = calculateMergeChanges([baseProj], scenario);

        // Update original to be the "during" period
        expect(result.toUpdate).toHaveLength(1);
        expect(result.toUpdate[0].id).toBe('proj1');
        expect(result.toUpdate[0].endDate).toBe('2024-03-31');
        expect(result.toUpdate[0].amount).toBe(2500);

        // Add "after" projection returning to normal
        expect(result.toAdd).toHaveLength(1);
        expect(result.toAdd[0].startDate).toBe('2024-04-01');
        expect(result.toAdd[0].amount).toBe(2000);
    });
});
