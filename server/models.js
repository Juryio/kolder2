const mongoose = require('mongoose');

/**
 * @typedef {object} Category
 * @property {string} name - The name of the category.
 * @property {mongoose.Schema.Types.ObjectId | null} parentId - The ID of the parent category. Null for top-level categories.
 */

/**
 * Mongoose schema for categories.
 * @type {mongoose.Schema<Category>}
 */
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
});

/**
 * @typedef {object} Snippet
 * @property {mongoose.Schema.Types.ObjectId} categoryId - The ID of the category this snippet belongs to.
 * @property {string} name - The name of the snippet.
 * @property {string} content - The content of the snippet.
 * @property {number} useCount - The number of times the snippet has been used.
 */

/**
 * Mongoose schema for snippets.
 * @type {mongoose.Schema<Snippet>}
 */
const snippetSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    content: String,
    useCount: { type: Number, default: 0 }
});

/**
 * @typedef {object} Theme
 * @property {string} backgroundColor - The background color of the application.
 * @property {string} contentBackgroundColor - The background color of content areas.
 * @property {string} textColor - The text color.
 * @property {string} accentColor - The accent color.
 */

/**
 * @typedef {object} Settings
 * @property {string} title - The title of the application.
 * @property {string} icon - The URL of the application icon.
 * @property {Theme} theme - The color theme of the application.
 */

/**
 * Mongoose schema for application settings.
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
    }
});

/**
 * @typedef {object} StartingSnippet
 * @property {string} name - The name of the starting snippet.
 * @property {string} content - The content of the starting snippet.
 */

/**
 * Mongoose schema for starting snippets.
 * @type {mongoose.Schema<StartingSnippet>}
 */
const startingSnippetSchema = new mongoose.schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
});

const Category = mongoose.model('Category', categorySchema);
const Snippet = mongoose.model('Snippet', snippetSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const StartingSnippet = mongoose.model('StartingSnippet', startingSnippetSchema);

module.exports = { Category, Snippet, Settings, StartingSnippet };
