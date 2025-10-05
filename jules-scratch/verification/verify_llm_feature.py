import re
from playwright.sync_api import Page, expect

def test_text_formalization(page: Page):
    """
    This test verifies that the text formalization feature works correctly.
    1. It opens the snippet editor.
    2. Enters a sentence in the informal "Du" form.
    3. Clicks the "Umschreiben (Sie)" button.
    4. Asserts that the text is correctly transformed into the formal "Sie" form.
    5. Takes a screenshot of the result.
    """
    # 1. Arrange: Go to the application homepage.
    page.goto("http://localhost:8448")

    # 2. Act: Click the "New Snippet" button to open the editor.
    # The button might take a moment to be ready after the initial data load.
    new_snippet_button = page.locator("#snippet-list-new-snippet-button")
    expect(new_snippet_button).to_be_visible(timeout=10000)
    new_snippet_button.click()

    # 3. Act: Enter informal text into the Quill editor.
    # The editor is identified by its role 'textbox'.
    editor_textbox = page.locator(".ql-editor")
    expect(editor_textbox).to_be_visible()
    informal_text = "Kannst du mir bitte helfen, das Problem zu lösen?"
    editor_textbox.fill(informal_text)

    # 4. Act: Click the "Umschreiben (Sie)" button.
    formalize_button = page.get_by_role("button", name="Umschreiben (Sie)")
    expect(formalize_button).to_be_enabled()
    formalize_button.click()

    # 5. Assert: Wait for the text to be updated to the formal version.
    # We expect the text to contain "Können Sie" or a similar formal phrase.
    # The AI's output can be variable, so we use a flexible regex.
    # We also give it a generous timeout because the model on a Pi can be slow.
    expect(editor_textbox).to_contain_text(re.compile(r"Können Sie|Würden Sie"), timeout=120000)

    # Check that the original informal phrase is gone.
    expect(editor_textbox).not_to_contain_text("Kannst du")

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/llm_formalize_feature.png")