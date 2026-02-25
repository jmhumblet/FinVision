const { execSync } = require('child_process');

const ideas = [
    {
        title: "Market Trends & Insights",
        description: `A dedicated module to provide users with external financial context. This feature should:
- Fetch and display key market indices (S&P 500, NASDAQ, etc.) or relevant financial indicators.
- Provide AI-driven analysis of how global trends (e.g., inflation rates, interest rate hikes) might impact the user's personal finances based on their projected cash flow.
- Include a news feed or curated articles related to personal finance and market movements.`
    },
    {
        title: "Dashboard Customization",
        description: `Empower users to personalize their main dashboard.
- Drag-and-drop interface to reorder KPI cards and widgets.
- Toggle visibility of specific sections (e.g., hide "Recent Transactions" if preferred).
- Save layout preferences to the user profile.`
    },
    {
        title: "Net Worth Dashboard",
        description: `A holistic view of the user's financial health, tracking assets vs. liabilities over time.
- **Total Net Worth KPI:** A prominent display of Total Assets minus Total Liabilities, with a trend indicator (e.g., +5% this month).
- **Asset Tracking:** A list of asset categories (Cash, Investments, Property, Vehicles) with manual entry or potential account linking.
- **Liability Tracking:** A list of liabilities (Mortgage, Loans, Credit Cards), potentially integrated with the Debt Payoff Strategist.
- **Historical Chart:** A line chart visualizing Net Worth progression over time (1Y, 5Y, Max).

**Stitch Screen:** \`PENDING_DESIGN_NET_WORTH\``
    },
    {
        title: "Smart Bill Calendar",
        description: `A visual calendar view to track upcoming bills and income, providing a clear "when" for cash flow.
- **Monthly Grid View:** Display the current month with days as cells.
- **Event Pills:** Represents recurring transactions (Bills in Red, Income in Green).
- **Balance Warnings:** Highlight days where the projected balance drops below a threshold (e.g., $0).
- **Drag-to-Reschedule:** Allow users to drag flexible bills to different days to simulate payment timing.
- **Quick Add:** Click on a date to quickly add a one-time transaction or bill.

**Stitch Screen:** \`PENDING_DESIGN_SMART_BILL_CALENDAR\``
    }
];

console.log(`Starting migration of ${ideas.length} ideas to GitHub Issues...`);

try {
    execSync('gh --version', { stdio: 'ignore' });
} catch (e) {
    console.error('Error: "gh" CLI tool is not found or not working. Please install GitHub CLI and authenticate.');
    process.exit(1);
}

for (const idea of ideas) {
    console.log(`Creating issue: "${idea.title}"...`);
    try {
        // Use --body-file - to read from stdin to avoid shell escaping issues
        execSync(`gh issue create --title "${idea.title}" --label "status: idea" --body-file -`, {
            input: idea.description,
            stdio: ['pipe', 'inherit', 'inherit']
        });
        console.log(`Successfully created issue: "${idea.title}"`);
    } catch (error) {
        console.error(`Failed to create issue "${idea.title}":`, error.message);
    }
}

console.log('Migration completed.');
