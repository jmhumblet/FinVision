from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:3000')

    # Wait a moment for rendering
    page.wait_for_timeout(2000)

    # Click Continue as Guest
    try:
        page.locator("button", has_text="Continue as Guest").click(timeout=3000)
    except Exception as e:
        print("No Guest button", e)

    page.wait_for_timeout(2000)

    # The skip button or anything in the main screen
    try:
        # Click Skip for now
        page.locator("button", has_text="Skip for now").click(timeout=3000)
    except Exception as e:
        print("No skip button", e)

    page.wait_for_timeout(2000)

    # Close any modal
    try:
        page.keyboard.press("Escape")
        page.keyboard.press("Escape")
    except:
        pass

    # Click the Market Trends nav button
    try:
        page.locator("button[title='Market Trends']").click(timeout=3000)
    except Exception as e:
        print("Failed to click Market Trends")
        raise e

    # Wait for the market trends page to render
    page.wait_for_timeout(2000)
    page.wait_for_selector("text=Market Trends & Insights")

    # Close the reconciliation modal by clicking 'Next' -> 'Skip' or 'Cancel' if present,
    # or just by hiding the modal wrapper via JS.
    page.evaluate('''
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => {
            if (modal.innerHTML.includes('Monthly Reconciliation')) {
                modal.style.display = 'none';
            }
        });
    ''')

    # Take a screenshot
    page.wait_for_timeout(1000)
    page.screenshot(path='verification/market_trends.png', full_page=True)
    browser.close()
