# FinVision Planner 🚀

FinVision is a sophisticated, AI-enhanced financial planning application designed to give users absolute clarity over their past spending and future cash flow. It combines real-time data synchronization with advanced predictive modeling and natural language intelligence.

![FinVision Screenshot](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000)

## ✨ Key Features

- **AI-Powered Quick Actions**: Use natural language to log expenses or update projections. Gemini 3 Pro understands context and maps input to structured data.
- **Smart Categorization**: Automatically classify "Other" transactions into relevant buckets using AI-driven pattern matching.
- **Dynamic Cash Flow Projections**: Visualize your bank balance up to a year into the future based on recurring income and expenses.
- **"What-If" Scenarios**: Create parallel financial realities. Model the impact of a 10% rent increase, a new job, or a lifestyle change without affecting your base plan.
- **Cloud Sync & Security**: Fully integrated with Firebase for secure Google Authentication and real-time cross-device synchronization.
- **Optimized Data Loading**: Implements monthly checkpointing for blazing-fast initial load times, even with years of transaction history.

## 🛠️ Tech Stack

- **Frontend**: React (18.2), TypeScript, Tailwind CSS
- **Visualization**: Recharts for high-performance interactive charting
- **Intelligence**: Google Gemini API (GenAI SDK)
- **Backend/Auth**: Firebase Firestore (Lite) & Firebase Auth
- **Icons**: Lucide React

## 🚀 Getting Started

1. **Prerequisites**: Ensure you have an environment capable of serving ES6 modules.
2. **Environment Variables**:
   - The application expects `process.env.API_KEY` to be configured with a valid Google Gemini API Key.
   - Firebase configuration is pre-wired to the demo instance but can be swapped in `services/firebaseService.ts`.
3. **Usage**:
   - Log in via Google or Guest mode.
   - Use **Ctrl + Enter** at any time to open the AI Quick Action window.
   - Use the **Scenario Builder** to compare different financial paths.

## 🧠 AI System Design

The application utilizes `gemini-3-flash-preview` for high-speed natural language processing. The system instructions are engineered to:
1. Parse amounts, dates, and frequencies from unstructured text.
2. Identify whether a user intent refers to a historical transaction or a future projection.
3. Automatically match entities to the user's specific projection IDs for seamless updates.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for better financial futures.*
