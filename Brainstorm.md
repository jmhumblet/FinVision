# Brainstorming New Features for FinVision

Based on the core goals outlined in `/conductor/product.md` (Financial Clarity, Predictive Modeling, AI Automation), here are 5 new feature ideas for FinVision:

## 1. Variable Income Smoother
**Concept:** A feature specifically designed for freelancers, gig workers, and those with commission-based income. It uses historical data and predictive modeling to create a "smoothed" reliable monthly income baseline.
**Alignment:** Directly supports "Predictive Modeling" and "Financial Clarity" for a growing segment of the workforce.

## 2. AI-Powered Bill Negotiation Assistant
**Concept:** An AI agent that analyzes the user's recurring bills (internet, insurance, subscriptions) and automatically suggests or even drafts negotiation scripts to lower rates, or recommends cheaper alternatives.
**Alignment:** Heavily leverages "AI Automation" to actively improve the user's financial situation.

## 3. Micro-Investing Simulator
**Concept:** A "What-If" module that simulates the long-term impact of rounding up spare change from daily transactions and investing it, visualizing potential portfolio growth over decades.
**Alignment:** Expands the "What-If Scenario Builder" into basic wealth building.

## 4. Shared "What-If" Collaboration
**Concept:** Allows users (e.g., partners, spouses) to link their accounts or share specific "What-If" scenarios to collaboratively plan for shared goals like buying a house or having a child.
**Alignment:** Enhances the utility of "Predictive Modeling" by adding a multiplayer element.

## 5. Auto-Rebalancing Savings Goals
**Concept:** When a user creates multiple smart savings goals, this feature uses AI to automatically reallocate monthly savings contributions based on changing deadlines or unexpected expenses, ensuring high-priority goals are funded first.
**Alignment:** Combines "AI Automation" with the existing "Smart Savings Goals" feature.

---

## Iteration & Selection

**Comparing the Ideas for Client Utility:**

*   **Micro-Investing Simulator** is a neat visualization but overlaps with many existing micro-investing apps (like Acorns). It doesn't solve a core cash-flow problem.
*   **Shared "What-If" Collaboration** is valuable for couples but introduces complex permissions, data privacy issues, and requires a critical mass of users.
*   **AI-Powered Bill Negotiation Assistant** is highly valuable but technically very challenging to implement reliably (requires scraping bill PDFs, understanding complex service tiers).
*   **Auto-Rebalancing Savings Goals** is useful optimization, but it's a "nice-to-have" refinement of an existing feature rather than a fundamentally new capability.
*   **Variable Income Smoother** addresses a massive and growing pain point. The existing MVP tools (like the Monthly Focus View) assume a predictable paycheck. For a freelancer, knowing how much is "safe to spend" when income fluctuates wildly is the ultimate test of "Financial Clarity" and "Predictive Modeling". It fulfills a desperate need for a specific, underserved user segment while perfectly utilizing FinVision's core strengths in cash flow visualization and modeling.

**Conclusion:**
The **Variable Income Smoother** is the most useful feature to implement next. It expands the target audience to non-traditional earners and provides immense value by creating stability out of volatility.
