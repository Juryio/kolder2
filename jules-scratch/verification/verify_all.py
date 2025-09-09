import json
from playwright.sync_api import sync_playwright, expect
import requests

# Helper function to set the database to a known state
def setup_database(data):
    print("Setting up database with sample data...")
    try:
        requests.post('http://localhost:8448/api/debug/import', json=data)
        print("Database setup complete.")
    except Exception as e:
        print(f"Database setup failed: {e}")
        exit(1)

def run(playwright):
    # --- Test Setup ---
    sample_data = {
        "categories": [{"_id": "60f1b3b3b3b3b3b3b3b3b3b3", "name": "Test Category", "parentId": None}],
        "snippets": [],
        "settings": [],
        "startingSnippets": []
    }
    setup_database(sample_data)

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8448")

    # --- 1. Verify Port ---
    print("Verifying application is on port 8448...")
    expect(page.get_by_text("Categories")).to_be_visible()
    print("Port verification passed.")

    # --- 2. Test Color Picker ---
    print("Testing color picker functionality...")
    # Open settings modal
    page.locator('header button').nth(3).click()

    # Change the Main Background color
    main_background_input = page.locator('input[name="backgroundColor"]')
    new_color = "#ff0000"
    main_background_input.fill(new_color)

    # Save the settings
    page.get_by_text("Save").click()

    # Verify that the background color has changed
    main_container = page.locator('body > div > div').first
    expect(main_container).to_have_css("background-color", "rgb(255, 0, 0)")
    print("Color picker test passed.")

    # --- 3. Test Export/Import ---
    print("Testing export/import functionality...")
    # Re-open settings modal
    page.locator('header button').nth(3).click()

    # Click the export button and wait for the download
    with page.expect_download() as download_info:
        page.locator('[data-testid="export-button"]').click()

    download = download_info.value
    download_path = download.path()

    # Close the settings modal
    page.get_by_text("Cancel").click()

    # Add a new category to change the state
    page.get_by_text("Add Category").click()
    page.locator('input[placeholder="Enter category name"]').fill("New Temp Category")
    page.get_by_text("Save").click()
    expect(page.get_by_text("New Temp Category")).to_be_visible()
    print("State changed for import test.")

    # Re-open the settings modal to import
    page.locator('header button').nth(3).click()

    # Import the previously exported file
    page.locator('input[type="file"]').set_input_files(download_path)
    expect(page.locator('.chakra-alert__title:has-text("Import Successful")')).to_be_visible()
    print("Import successful toast appeared.")

    # Refresh the page to see the changes
    page.reload()

    # Verify that the state has been restored
    expect(page.get_by_text("New Temp Category")).not_to_be_visible()
    expect(page.get_by_text("Test Category")).to_be_visible()
    print("Import/Export test passed.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
