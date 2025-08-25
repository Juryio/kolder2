from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    try:
        page.goto("http://localhost:5178/")

        # Wait for the main content to load by looking for the category tree
        page.wait_for_selector("aside", timeout=10000)

        # Click the "New Snippet" button
        # It's in a flex container with the heading "Snippets"
        page.locator('button:has-text("New Snippet")').click()

        # Wait for the modal to appear
        modal = page.locator('section.chakra-modal__content')
        expect(modal).to_be_visible()

        # Click the "Insert Date" button within the modal
        modal.locator('button:has-text("Insert Date")').click()

        # Take a screenshot of the modal content
        modal.screenshot(path="jules-scratch/debug/editor_state.png")

        print("Successfully captured editor state.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/debug/error.png")

    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)
