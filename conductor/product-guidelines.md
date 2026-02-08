# Product Guidelines - FinVision

## Tone and Voice
- **Friendly & Accessible**: Communication should be conversational and encouraging, aiming to reduce the stress and complexity often associated with financial planning. The goal is to make users feel supported rather than overwhelmed.

## Visual Identity
- **Modern & Minimalist**: The aesthetic prioritizes high use of whitespace, clean typography, and a "less is more" philosophy. This supports the dual-layer interface by keeping initial interactions simple and focused.

## User Experience (UX) Principles
- **Progressive Disclosure**: Information is presented in layers. Users start with a high-level, minimalist overview and can choose to drill down into more detailed, data-rich screens as their needs evolve.
- **AI-Guided Interaction**: An integrated AI assistant serves as a primary interaction layer, helping users navigate features, log data, and interpret complex "what-if" scenarios through natural language.

## Data Visualization Guidelines
- **Clarity over Complexity**: Prioritize high-impact, easy-to-read charts (e.g., line and bar charts). Visualizations should provide immediate insights at a glance without requiring deep technical knowledge.

## Data Privacy & Transparency
- **Transparent Audit Log**: Users should have clear visibility into when and how their data was last synchronized or modified, fostering trust and providing a clear trail of financial updates.

## Testing & QA Guidelines
- **Visual Regression**: **No snapshots for dynamic data.** Do not use visual snapshot testing for screens with variable data (dates, IDs, live calcs) unless fully mocked/masked. Prioritize robust locator assertions.
