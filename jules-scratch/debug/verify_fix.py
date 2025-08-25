from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    try:
        page.goto("http://localhost:5178/")

        # --- 1. Create a new snippet with a date placeholder ---
        page.wait_for_selector("aside", timeout=10000)
        page.locator('button:has-text("New Snippet")').click()

        modal = page.locator('section.chakra-modal__content')
        expect(modal).to_be_visible()

        # Give it a name
        modal.locator('input[placeholder="Name"]').fill("Test Date Snippet")

        # Insert a date placeholder
        modal.locator('button:has-text("Insert Date")').click()

        # Save it
        modal.locator('button:has-text("Save")').click()
        expect(modal).not_to_be_visible()

        # --- 2. Find and re-open the snippet for editing ---
        # The snippet list should now contain our new snippet
        snippet_entry = page.locator('div:has-text("Test Date Snippet")').first
        expect(snippet_entry).to_be_visible()

        # Click the edit button associated with this snippet
        # The button is a sibling in a flex container
        snippet_entry.locator('xpath=./following-sibling::div/button[1]').click()

        # --- 3. Click the placeholder and verify the calendar appears ---
        expect(modal).to_be_visible()

        # Find the placeholder blot and click it
        placeholder_blot = modal.locator('span.date-placeholder:has-text("{{date_1}}")')
        expect(placeholder_blot).to_be_visible()
        placeholder_blot.click()

        # Assert that the datepicker popover is now visible
        datepicker_popover = page.locator('.react-datepicker')
        expect(datepicker_popover).to_be_visible(timeout=5000)

        print("SUCCESS: Datepicker popover appeared on click.")

        # Take a screenshot for visual confirmation
        page.screenshot(path="jules-scratch/debug/fix_verified.png")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/debug/error.png")

    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)
