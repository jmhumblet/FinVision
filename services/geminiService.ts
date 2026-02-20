import { Category, Transaction, Projection, QuickActionResponse } from "../types";

const categorizeTransactions = async (
  transactions: Partial<Transaction>[],
  categories: Category[]
): Promise<Map<string, string>> => {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, categories })
    });

    if (!response.ok) throw new Error('Failed to categorize transactions via proxy');

    const data = await response.json();
    const jsonStr = data.text;
    if (!jsonStr) return new Map();

    const mappings = JSON.parse(jsonStr) as { transactionId: string, categoryId: string }[];
    const resultMap = new Map<string, string>();
    
    mappings.forEach(m => {
      // Basic validation to ensure we don't map to non-existent categories
      if (categories.some(c => c.id === m.categoryId)) {
        resultMap.set(m.transactionId, m.categoryId);
      }
    });

    return resultMap;
  } catch (error) {
    console.error("Error categorizing transactions with Gemini via proxy:", error);
    return new Map();
  }
};

const processNaturalLanguageAction = async (
  history: { role: string, text: string }[],
  categories: Category[],
  existingProjections: Projection[] = []
): Promise<QuickActionResponse> => {
  try {
    const response = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, categories, existingProjections })
    });

    if (!response.ok) throw new Error('Failed to process quick action via proxy');

    const data = await response.json();
    const result = JSON.parse(data.text || "{}") as QuickActionResponse;
    return result;

  } catch (error) {
    console.error("Quick Action AI Error via proxy:", error);
    return {
      status: "CLARIFICATION_NEEDED",
      message: "I'm having trouble connecting. Could you repeat that?"
    };
  }
};

export const geminiService = {
  categorizeTransactions,
  processNaturalLanguageAction
};
