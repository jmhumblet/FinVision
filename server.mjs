import http from 'http';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "missing-key-for-testing";
const ai = new GoogleGenAI({ apiKey });

const server = http.createServer(async (req, res) => {
  // Add basic CORS headers for safety, although Vite proxy handles it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);

        if (req.url === '/api/categorize') {
          const { transactions, categories } = payload;
          const txList = transactions.map(t => ({ id: t.id, description: t.description, amount: t.amount }));
          const catList = categories.map(c => ({ id: c.id, name: c.name }));

          const prompt = `
            You are a financial assistant. I have a list of bank transactions and a list of categories.
            Please map each transaction to the most appropriate category ID based on its description and amount.

            Rules:
            1. Only assign a category if you are reasonably confident.
            2. If a transaction is vague or fits 'Other' best, DO NOT include it in the output (I will handle it manually).
            3. Return a JSON array of objects with 'transactionId' and 'categoryId'.

            Categories: ${JSON.stringify(catList)}

            Transactions: ${JSON.stringify(txList)}
          `;

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    transactionId: { type: Type.STRING },
                    categoryId: { type: Type.STRING },
                  },
                  required: ["transactionId", "categoryId"]
                }
              }
            }
          });
          res.end(JSON.stringify({ text: response.text }));

        } else if (req.url === '/api/action') {
          const { history, categories, existingProjections } = payload;
          const today = new Date().toISOString().split('T')[0];
          const catList = categories.map(c => `${c.name} (ID: ${c.id})`).join(", ");
          const projectionContext = (existingProjections || []).map(p =>
            `{ID: "${p.id}", Name: "${p.name}", Amount: ${p.amount}, Freq: ${p.frequency}}`
          ).join("\n");

          const systemInstruction = `
            You are a smart financial assistant helping a user manage their finances.
            Current Date: ${today}.

            CONTEXT:
            Available Categories: ${catList}.
            Existing Projections:
            ${projectionContext}

            YOUR GOAL:
            Create a Transaction (past/historical), Create a Projection (future/recurring), OR Update an existing Projection based on user input.

            RULES:
            1. **Analyze History**: Look at the conversation to understand intent.
            2. **Updates**: If the user says something like "Electricity is up 20" or "Change Rent to 1500", look for a matching Existing Projection.
               - If "up by X", add X to current amount.
               - If "down by X", subtract X.
               - If "to X", set amount to X.
               - Return actionType="UPDATE" and the projectionData with the MATCHING ID and NEW calculated amount.
            3. **Creation**: If no existing record matches or user implies new, use actionType="CREATE".
               - For TRANSACTIONS (e.g. "Spent 50", "Bought groceries"): Default date to today. Infer Type (INCOME/EXPENSE). Default Category to '8'.
               - For PROJECTIONS (e.g. "Add monthly rent", "New subscription", "Salary 2000"): Need Name, Amount, Frequency, Start Date.
                 - If user mentions an end date (e.g. "until Dec 2025"), populate 'endDate'.
            4. **Clarification**: If info is missing (e.g. amount), set status="CLARIFICATION_NEEDED" and ask specifically.
            5. **Ambiguity**: If request is unclear between Transaction vs Projection, ask.

            RESPONSE FORMAT:
            Always return strict JSON conforming to the schema.
          `;

          const contents = history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
          }));

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["CLARIFICATION_NEEDED", "COMPLETED"] },
                  message: { type: Type.STRING },
                  actionType: { type: Type.STRING, enum: ["CREATE", "UPDATE"] },
                  recordType: { type: Type.STRING, enum: ["TRANSACTION", "PROJECTION"] },
                  transactionData: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      date: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
                      categoryId: { type: Type.STRING }
                    }
                  },
                  projectionData: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Required for updates" },
                      name: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      frequency: { type: Type.STRING, enum: ["ONCE", "WEEKLY", "MONTHLY", "YEARLY"] },
                      startDate: { type: Type.STRING },
                      endDate: { type: Type.STRING, description: "Optional YYYY-MM-DD" },
                      type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
                      categoryId: { type: Type.STRING }
                    }
                  }
                },
                required: ["status", "message"]
              }
            }
          });
          res.end(JSON.stringify({ text: response.text }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "Not found" }));
        }
      } catch (error) {
        console.error("Backend Proxy Error:", error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend proxy running on port ${PORT}`);
});
