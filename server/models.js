const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    // A null parentId indicates a top-level category
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
});

const snippetSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    content: String,
    useCount: { type: Number, default: 0 },
});

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

const Category = mongoose.model('Category', categorySchema);
const Snippet = mongoose.model('Snippet', snippetSchema);
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { Category, Snippet, Settings };
