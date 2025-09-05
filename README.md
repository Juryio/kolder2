# Kolder - Your Personal Snippet Manager

Kolder is a full-stack web application designed to help you store, organize, and manage your code snippets and text templates efficiently. With a clean, intuitive interface, Kolder allows you to categorize your snippets, use powerful placeholder features, and access your content from anywhere.

## Features

*   **Hierarchical Categories**: Organize your snippets into a nested tree of categories.
*   **Drag-and-Drop**: Easily reorder categories and move snippets between them.
*   **Powerful Placeholders**: Create dynamic snippets with text, date, and choice placeholders.
    *   **Text Placeholders**: `{{name}}`
    *   **Date Placeholders**: `{{date:invoice_date}}` with support for date arithmetic `{{date:invoice_date + 7d}}`.
    *   **Choice Placeholders**: `{{select:salutation:dropdown:Mr:Mrs:Ms}}`
*   **Snippet Viewer**: A dedicated view to fill in placeholders and preview the final text.
*   **Starting Snippets**: Create reusable templates to prefix your main snippets.
*   **Usage Analytics**: Track how often you use each snippet.
*   **Customizable Theme**: Change the look and feel of the application to your liking.

## Project Structure

The project is a monorepo containing two main parts:

*   `server/`: A Node.js/Express backend that provides a REST API for managing snippets and categories. It uses MongoDB for data storage.
*   `kolder-app/`: A React frontend built with Vite. It uses Chakra UI for components and `react-dnd` for drag-and-drop functionality.

## Setup and Installation

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later)
*   [MongoDB](https://www.mongodb.com/try/download/community)

### Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3001` by default.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd kolder-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` by default.

## How to Use

1.  **Create Categories**: Use the "Add Category" button in the left panel to create your first category. You can create nested categories by clicking the "+" icon next to a category name.
2.  **Add Snippets**: Select a category and click "New Snippet". This will open an editor where you can name your snippet and add content.
3.  **Use Placeholders**: In the snippet editor, use the `{{...}}` syntax to create placeholders, or use the "Insert Placeholder" button to build them with a UI.
4.  **View and Use Snippets**: Click on a snippet in the list to open it in the viewer. Fill in any placeholders, and click "Copy to Clipboard" to get the final text.
5.  **Customize**: Click the settings icon in the header to change the application title, icon, and theme colors.