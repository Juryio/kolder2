const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { Category, Snippet, Settings } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/kolderdb';

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../kolder-app/dist')));

// --- Database Connection ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
        // Seed initial settings data if none exists
        Settings.findOne().then(settings => {
            if (!settings) {
                new Settings().save().then(() => console.log('Default settings created.'));
            }
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));


// --- API Endpoints ---

// Helper to build category tree for the frontend from a flat list
const buildTree = (categories, parentId = null) => {
    const tree = [];
    categories
        .filter(cat => String(cat.parentId) === String(parentId))
        .forEach(cat => {
            const children = buildTree(categories, cat._id);
            // Mongoose documents are not easily extensible, so we convert to a plain object
            const catObj = cat.toObject();
            tree.push({
                ...catObj,
                children: children
            });
        });
    return tree;
};

// Categories
app.get('/api/categories', async (req, res) => {
    try {
        const flatCategories = await Category.find();
        const tree = buildTree(flatCategories);
        res.json(tree);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const newCategory = new Category({ name, parentId: parentId || null });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
        res.json(updatedCategory);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send('Category not found');

        // This custom remove function will also trigger the pre-remove hook for children
        const removeWithChildren = async (catId) => {
            const children = await Category.find({ parentId: catId });
            for (const child of children) {
                await removeWithChildren(child._id);
            }
            await Snippet.deleteMany({ categoryId: catId });
            await Category.findByIdAndDelete(catId);
        };

        await removeWithChildren(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Snippets
app.get('/api/snippets', async (req, res) => {
    try {
        const snippets = await Snippet.find();
        res.json(snippets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/snippets', async (req, res) => {
    try {
        const newSnippet = new Snippet(req.body);
        await newSnippet.save();
        res.status(201).json(newSnippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/snippets/:id', async (req, res) => {
    try {
        const updatedSnippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSnippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/snippets/:id', async (req, res) => {
    try {
        await Snippet.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Settings
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await new Settings().save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/settings', async (req, res) => {
    try {
        // Use findOneAndUpdate with upsert to create the document if it doesn't exist.
        const updatedSettings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(updatedSettings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Analytics
app.post('/api/snippets/:id/track', async (req, res) => {
    try {
        const snippet = await Snippet.findByIdAndUpdate(req.params.id, { $inc: { useCount: 1 } }, { new: true });
        res.json(snippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/analytics/reset', async (req, res) => {
    try {
        await Snippet.updateMany({}, { useCount: 0 });
        const updatedSnippets = await Snippet.find();
        res.status(200).json(updatedSnippets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- Catch-all for Frontend Routing ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../kolder-app/dist/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
