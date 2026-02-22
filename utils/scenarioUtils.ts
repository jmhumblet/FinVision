import { Projection, Scenario, AdjustmentType } from "../types";
import { v4 as uuidv4 } from "uuid";

// Helper to parse YYYY-MM-DD
const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Helper to format Date back to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to add days
const addDays = (dateStr: string, days: number): string => {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

export interface MergeResult {
  toAdd: Projection[];
  toUpdate: Projection[];
  toDelete: string[];
}

export const calculateMergeChanges = (
  projections: Projection[],
  scenario: Scenario
): MergeResult => {
  const toAdd: Projection[] = [];
  const toUpdate: Projection[] = [];
  const toDelete: string[] = [];
  const processedProjIds = new Set<string>();

  // 1. Process New Projections
  if (scenario.newProjections) {
    toAdd.push(...scenario.newProjections);
  }

  // 2. Process Adjustments
  scenario.adjustments.forEach((adj) => {
    // Only process the first adjustment for a given projection to match generateTimeline behavior
    if (processedProjIds.has(adj.projectionId)) return;
    processedProjIds.add(adj.projectionId);

    const original = projections.find((p) => p.id === adj.projectionId);
    if (!original) return;

    // Check if we already plan to delete this (shouldn't happen with set check, but safety first)
    if (toDelete.includes(original.id)) return;

    if (adj.type === AdjustmentType.REMOVE_RECORD) {
        // If removal starts in future, end the current one instead of deleting
        if (adj.startDate && adj.startDate > original.startDate) {
            const newEndDate = addDays(adj.startDate, -1);
            // Only update if newEndDate is valid (before original end date if exists)
            if (!original.endDate || newEndDate < original.endDate) {
                 const updated = { ...original, endDate: newEndDate };
                 toUpdate.push(updated);
            }
        } else {
            toDelete.push(original.id);
        }
        return;
    }

    // Calculate New Amount
    let newAmount = original.amount;
    if (adj.type === AdjustmentType.SET_AMOUNT) newAmount = adj.value;
    else if (adj.type === AdjustmentType.ADD_AMOUNT) newAmount += adj.value;
    else if (adj.type === AdjustmentType.PERCENTAGE_INCREASE) newAmount *= (1 + adj.value / 100);
    else if (adj.type === AdjustmentType.PERCENTAGE_DECREASE) newAmount *= (1 - adj.value / 100);

    // Round to 2 decimals to avoid floating point issues
    newAmount = Math.round(newAmount * 100) / 100;

    // Determine Split Logic
    const adjStart = adj.startDate || original.startDate;
    const adjEnd = adj.endDate;

    const isFutureStart = adjStart > original.startDate;

    // Case A: Future Start (Split)
    if (isFutureStart) {
        // 1. Terminate Original
        const originalEndDate = addDays(adjStart, -1);
        toUpdate.push({ ...original, endDate: originalEndDate });

        // 2. Create Middle Part (The Adjusted Period)
        const middleProj: Projection = {
            ...original,
            id: uuidv4(),
            startDate: adjStart,
            amount: newAmount,
            // If adj has end date, use it. Else use original end date.
            endDate: adjEnd || original.endDate
        };
        toAdd.push(middleProj);

        // 3. Create After Part (Return to Original) IF adj has end date
        if (adjEnd) {
             // Only if original didn't end before adjEnd
             if (!original.endDate || original.endDate > adjEnd) {
                 const afterProj: Projection = {
                     ...original,
                     id: uuidv4(),
                     startDate: addDays(adjEnd, 1),
                     amount: original.amount, // Back to original amount
                     endDate: original.endDate
                 };
                 toAdd.push(afterProj);
             }
        }
    }
    // Case B: Immediate Start (Update Original directly, maybe split end)
    else {
        // If there is an end date for the adjustment (Temporary Change starting now)
        if (adjEnd) {
             // Update original to be the "During" part
             toUpdate.push({
                 ...original,
                 amount: newAmount,
                 endDate: adjEnd
             });

             // Create "After" part
             if (!original.endDate || original.endDate > adjEnd) {
                 const afterProj: Projection = {
                     ...original,
                     id: uuidv4(),
                     startDate: addDays(adjEnd, 1),
                     amount: original.amount, // Back to original
                     endDate: original.endDate
                 };
                 toAdd.push(afterProj);
             }
        } else {
            // Permanent Change starting now
            toUpdate.push({
                ...original,
                amount: newAmount
                // keep original startDate and endDate
            });
        }
    }
  });

  return { toAdd, toUpdate, toDelete };
};
