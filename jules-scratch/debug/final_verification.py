from playwright.sync_api import sync_playwright, expect
from datetime import datetime, timedelta

def run_verification(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    try:
        page.goto("http://localhost:5173/")
        page.wait_for_selector("aside", timeout=15000)

        # --- 1. Test Search Focus ---
        print("Testing search focus...")
        search_input = page.get_by_placeholder("Search all snippets...")
        search_input.type("test", delay=100)
        expect(search_input).to_have_value("test")
        # Clear search for next steps
        search_input.fill("")
        print("Search focus test PASSED.")

        # --- 2. Test Date Placeholder Creation and UI ---
        print("Testing placeholder creation...")
        page.locator('button:has-text("New Snippet")').click()

        modal = page.locator('section.chakra-modal__content')
        expect(modal).to_be_visible()

        modal.locator('input[placeholder="Name"]').fill("Final Verification Snippet")

        # Insert two date placeholders
        date_button = modal.locator('button:has-text("Insert Date")')
        date_button.click()
        date_button.click()

        # Check editor content
        editor_content = modal.locator(".ql-editor p")
        expect(editor_content).to_have_text("{{date_1}}{{date_2}}")

        # Check for the new DateManager UI
        date_manager = modal.locator('div:has-text("Date Variables")')
        expect(date_manager).to_be_visible()
        expect(date_manager.locator('label:has-text("date_1")')).to_be_visible()
        expect(date_manager.locator('label:has-text("date_2")')).to_be_visible()
        print("Placeholder creation and UI test PASSED.")

        # --- 3. Test Date Selection and Evaluation ---
        print("Testing date selection...")
        # Select a date for date_1. Let's pick the 15th day of the current month.
        date_manager.locator('label:has-text("date_1") + input').click()
        page.locator('.react-datepicker__day--015').click()

        # The date picker should close, and the input should have the date.
        # We'll verify the result in the viewer.

        # Save the snippet
        modal.locator('button:has-text("Save")').click()
        expect(modal).not_to_be_visible()

        # --- 4. View the snippet and verify evaluation ---
        print("Testing placeholder evaluation...")
        # Click the snippet to view it
        page.locator('text=Final Verification Snippet').click()

        viewer_content = page.locator('div[dangerouslysetinnerhtml]')

        # Calculate expected date (YYYY-MM-15)
        today = datetime.today()
        expected_date = today.replace(day=15)
        expected_date_str = expected_date.strftime("%Y-%m-%d")

        # Check that the evaluated content is correct
        expect(viewer_content).to_contain_text(expected_date_str)
        expect(viewer_content).to_contain_text("{{date_2: Unset}}")
        print("Placeholder evaluation test PASSED.")

        # --- 5. Take final screenshot ---
        page.screenshot(path="jules-scratch/debug/final_verification.png")
        print("Successfully created final verification screenshot.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/debug/error.png")

    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)
