# Tech Stack - FinVision

## Frontend
- **Framework**: React (18.2.0)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (2.15.0)
- **Icons**: Lucide React (0.469.0)

## AI & Intelligence
- **Model**: Google Gemini API (`gemini-3-flash-preview` via `@google/genai`)
- **Integration**: Natural language parsing for transactions and "what-if" scenarios.

## Backend & Services
- **Database**: Firebase Firestore (Lite)
- **Authentication**: Firebase Auth (Google Authentication & Guest Mode)
- **Real-time**: Real-time synchronization across devices.

## Testing
- **Unit & Integration**: Vitest, React Testing Library
- **End-to-End (E2E)**: Playwright
    - **Strategy**: Deterministic mocking of service layer (`mockFirebaseService`) for standard tests; separate suite for real integration.
- **Coverage**: v8

## Build & Infrastructure
- **Build Tool**: Vite (6.2.0)
- **Deployment**: Configured for modern ES6 module environments.
- **Git Flow**: GitHub CLI (`gh`) for PR automation.
