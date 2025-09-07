from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3001")

    # Open the calendar modal
    page.locator('header button').nth(2).click()

    # Take a screenshot for visual verification
    page.screenshot(path="jules-scratch/verification/locale_check.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
