const mongoose = require('mongoose');

/**
 * @typedef {object} Category
 * @property {string} name - The name of the category.
 * @property {mongoose.Schema.Types.ObjectId | null} parentId - The ID of the parent category. Null for top-level categories.
 */

/**
 * Mongoose schema for a Category.
 * Categories can be nested, forming a tree structure.
 * @type {mongoose.Schema<Category>}
 */
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    // A null parentId indicates a top-level category
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
});

/**
 * @typedef {object} Snippet
 * @property {mongoose.Schema.Types.ObjectId} categoryId - The ID of the category this snippet belongs to.
 * @property {string} name - The name of the snippet.
 * @property {string} content - The content of the snippet.
 * @property {number} useCount - The number of times the snippet has been used.
 */

/**
 * Mongoose schema for a Snippet.
 * Snippets are the core content of the application.
 * @type {mongoose.Schema<Snippet>}
 */
const snippetSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true },
    content: String,
    useCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    embedding: { type: [Number] }
});

// Add a text index to support fast, text-based searching across multiple fields.
snippetSchema.index({ name: 'text', content: 'text', tags: 'text' });

/**
 * @typedef {object} Theme
 * @property {string} backgroundColor - The background color of the application.
 * @property {string} contentBackgroundColor - The background color of content areas.
 * @property {string} textColor - The text color of the application.
 * @property {string} accentColor - The accent color for buttons and other interactive elements.
 */

/**
 * @typedef {object} Settings
 * @property {string} title - The title of the application.
 * @property {string} icon - The URL of the application's icon.
 * @property {Theme} theme - The theme settings for the application.
 */

/**
 * Mongoose schema for application Settings.
 * There should only be one settings document in the database.
 * @type {mongoose.Schema<Settings>}
 */
const settingsSchema = new mongoose.Schema({
    title: { type: String, default: 'Kolder' },
    icon: { type: String, default: '' },
    theme: {
        backgroundColor: { type: String, default: '#1A202C' },
        contentBackgroundColor: { type: String, default: '#2D3748' },
        textColor: { type: String, default: '#EDF2F7' },
        accentColor: { type: String, default: '#805AD5' },
    },
    languageToolEnabled: { type: Boolean, default: false },
    languageToolApiUrl: { type: String, default: 'http://languagetool:8010/v2/check' },
});

/**
 * @typedef {object} StartingSnippet
 * @property {string} name - The name of the starting snippet.
 * @property {string} content - The content of the starting snippet.
 */

/**
 * Mongoose schema for a Starting Snippet.
 * Starting snippets are templates for creating new snippets.
 * @type {mongoose.Schema<StartingSnippet>}
 */
const startingSnippetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
});

const Category = mongoose.model('Category', categorySchema);
const Snippet = mongoose.model('Snippet', snippetSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const StartingSnippet = mongoose.model('StartingSnippet', startingSnippetSchema);

module.exports = { Category, Snippet, Settings, StartingSnippet };
