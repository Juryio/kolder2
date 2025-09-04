import requests
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    # Clear the database before running the tests
    requests.post("http://localhost:3001/api/testing/clear-db")

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5173/")

    # Wait for the main view to load
    expect(page.get_by_text("Categories")).to_be_visible()

    # Try to add a category.
    page.locator("#category-widget-add-button").click()
    page.locator("#new-category-name-input").fill("Test Category")
    page.locator("#new-category-save-button").click()

    # Check that the category was added.
    expect(page.get_by_text("Test Category")).to_be_visible()

    # Now, click the category to select it.
    page.get_by_text("Test Category").click()

    # Now, try to open the snippet editor
    page.locator("#snippet-list-new-snippet-button").click()

    # The SnippetEditor should be visible now.
    expect(page.get_by_text("New Snippet")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/final_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
