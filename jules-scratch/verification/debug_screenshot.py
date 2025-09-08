from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8448")

    # Open settings modal
    page.locator('header button').nth(3).click()

    # Take a screenshot for debugging
    page.screenshot(path="jules-scratch/verification/debug_ui.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
