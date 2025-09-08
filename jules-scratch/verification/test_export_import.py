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

    # --- 1. Test Export ---
    print("Testing export functionality...")
    # Open settings modal
    page.locator('header button').nth(3).click()

    # Click the export button and wait for the download
    with page.expect_download() as download_info:
        page.get_by_text("Export Data").click()

    download = download_info.value
    download_path = download.path()

    # Verify the downloaded file content
    with open(download_path, 'r') as f:
        exported_data_str = f.read()
        exported_data = json.loads(exported_data_str)

    # Basic check to see if the data is there
    assert len(exported_data['categories']) == 1
    assert exported_data['categories'][0]['name'] == 'Test Category'
    print("Export test passed: Data exported correctly.")

    # Close the settings modal
    page.get_by_text("Cancel").click()

    # --- 2. Test Import ---
    print("Testing import functionality...")
    # Add a new category to change the state
    page.get_by_text("Add Category").click()
    page.locator('input[placeholder="Enter category name"]').fill("New Temp Category")
    page.get_by_text("Save").click()
    # Wait for the new category to appear
    expect(page.get_by_text("New Temp Category")).to_be_visible()
    print("State changed: New category added.")

    # Re-open the settings modal to import
    page.locator('header button').nth(3).click()

    # Import the previously exported file
    page.locator('input[type="file"]').set_input_files(download_path)

    # Wait for the success toast
    success_toast = page.locator('.chakra-alert__title:has-text("Import Successful")')
    expect(success_toast).to_be_visible()

    print("Import successful toast appeared.")

    # Refresh the page to see the changes
    page.reload()

    # Verify that the state has been restored
    # The "New Temp Category" should be gone
    expect(page.get_by_text("New Temp Category")).not_to_be_visible()
    # The original "Test Category" should be present
    expect(page.get_by_text("Test Category")).to_be_visible()
    print("Import test passed: Data restored correctly.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
