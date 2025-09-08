const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { Category, Snippet, Settings, StartingSnippet } = require('./models');

const app = express();
const PORT = process.env.PORT || 8448;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kolderdb';

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

/**
 * Recursively builds a tree structure from a flat list of categories.
 * @param {Array<Category>} categories - The flat list of categories from the database.
 * @param {mongoose.Schema.Types.ObjectId | null} parentId - The ID of the parent category to find children for.
 * @returns {Array<Category>} A tree of categories, where each category object has a `children` property.
 */
const buildTree = (categories, parentId = null) => {
    const tree = [];
    categories
        .filter(cat => {
            // Handle root categories (parentId is null)
            if (parentId === null) {
                return cat.parentId === null;
            }
            // Handle child categories (compare ObjectId)
            return cat.parentId && cat.parentId.equals(parentId);
        })
        .forEach(cat => {
            const children = buildTree(categories, cat._id);
            const catObj = cat.toObject();
            tree.push({
                ...catObj,
                children: children
            });
        });
    return tree;
};

// Categories

/**
 * @route GET /api/categories
 * @description Get all categories as a tree structure.
 * @returns {Array<Category>} 200 - A tree of categories.
 * @returns {object} 500 - An error object.
 */
app.get('/api/categories', async (req, res) => {
    try {
        const flatCategories = await Category.find();
        const tree = buildTree(flatCategories);
        res.json(tree);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route POST /api/categories
 * @description Create a new category.
 * @param {object} req.body - The category to create.
 * @param {string} req.body.name - The name of the category.
 * @param {string} [req.body.parentId] - The ID of the parent category.
 * @returns {Category} 201 - The newly created category.
 * @returns {object} 500 - An error object.
 */
app.post('/api/categories', async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const newCategory = new Category({ name, parentId: parentId || null });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route PUT /api/categories/:id
 * @description Update a category.
 * @param {string} req.params.id - The ID of the category to update.
 * @param {object} req.body - The fields to update.
 * @param {string} [req.body.name] - The new name of the category.
 * @param {string} [req.body.parentId] - The new parent ID of the category.
 * @returns {Category} 200 - The updated category.
 * @returns {object} 400 - An error object if the update creates a circular dependency.
 * @returns {object} 404 - An error object if the category is not found.
 * @returns {object} 500 - An error object.
 */
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const categoryToUpdate = await Category.findById(req.params.id);

        if (!categoryToUpdate) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Build the update object
        const update = {};
        if (name) update.name = name;
        // The parentId can be null (for root categories)
        if (parentId !== undefined) {
             // Circular dependency check
            let currentParentId = parentId;
            while(currentParentId) {
                if (currentParentId.toString() === categoryToUpdate._id.toString()) {
                    return res.status(400).json({ error: 'Cannot move a category into its own descendant.' });
                }
                const parent = await Category.findById(currentParentId);
                currentParentId = parent ? parent.parentId : null;
            }
            update.parentId = parentId;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );

        res.json(updatedCategory);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route DELETE /api/categories/:id
 * @description Delete a category and all its descendants and associated snippets.
 * @param {string} req.params.id - The ID of the category to delete.
 * @returns {void} 204 - No content.
 * @returns {object} 404 - An error object if the category is not found.
 * @returns {object} 500 - An error object.
 */
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

/**
 * @route GET /api/snippets
 * @description Get all snippets.
 * @returns {Array<Snippet>} 200 - A list of all snippets.
 * @returns {object} 500 - An error object.
 */
app.get('/api/snippets', async (req, res) => {
    try {
        const snippets = await Snippet.find();
        res.json(snippets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route POST /api/snippets
 * @description Create a new snippet.
 * @param {object} req.body - The snippet to create.
 * @returns {Snippet} 201 - The newly created snippet.
 * @returns {object} 500 - An error object.
 */
app.post('/api/snippets', async (req, res) => {
    try {
        const newSnippet = new Snippet(req.body);
        await newSnippet.save();
        res.status(201).json(newSnippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route PUT /api/snippets/:id
 * @description Update a snippet.
 * @param {string} req.params.id - The ID of the snippet to update.
 * @param {object} req.body - The fields to update.
 * @returns {Snippet} 200 - The updated snippet.
 * @returns {object} 500 - An error object.
 */
app.put('/api/snippets/:id', async (req, res) => {
    try {
        const updatedSnippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSnippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route DELETE /api/snippets/:id
 * @description Delete a snippet.
 * @param {string} req.params.id - The ID of the snippet to delete.
 * @returns {void} 204 - No content.
 * @returns {object} 500 - An error object.
 */
app.delete('/api/snippets/:id', async (req, res) => {
    try {
        await Snippet.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Settings

/**
 * @route GET /api/settings
 * @description Get the application settings.
 * @returns {Settings} 200 - The application settings.
 * @returns {object} 500 - An error object.
 */
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await new Settings().save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route PUT /api/settings
 * @description Update the application settings.
 * @param {object} req.body - The new settings.
 * @returns {Settings} 200 - The updated settings.
 * @returns {object} 500 - An error object.
 */
app.put('/api/settings', async (req, res) => {
    try {
        // Use findOneAndUpdate with upsert to create the document if it doesn't exist.
        const updatedSettings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(updatedSettings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Analytics

/**
 * @route POST /api/snippets/:id/track
 * @description Increment the use count of a snippet.
 * @param {string} req.params.id - The ID of the snippet to track.
 * @returns {Snippet} 200 - The updated snippet.
 * @returns {object} 500 - An error object.
 */
app.post('/api/snippets/:id/track', async (req, res) => {
    try {
        const snippet = await Snippet.findByIdAndUpdate(req.params.id, { $inc: { useCount: 1 } }, { new: true });
        res.json(snippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route POST /api/analytics/reset
 * @description Reset the use count of all snippets to 0.
 * @returns {Array<Snippet>} 200 - The updated list of all snippets.
 * @returns {object} 500 - An error object.
 */
app.post('/api/analytics/reset', async (req, res) => {
    try {
        await Snippet.updateMany({}, { useCount: 0 });
        const updatedSnippets = await Snippet.find();
        res.status(200).json(updatedSnippets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- API Endpoints for Starting Snippets ---

/**
 * @route GET /api/starting-snippets
 * @description Get all starting snippets.
 * @returns {Array<StartingSnippet>} 200 - A list of all starting snippets.
 * @returns {object} 500 - An error object.
 */
app.get('/api/starting-snippets', async (req, res) => {
    try {
        const snippets = await StartingSnippet.find();
        res.json(snippets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route POST /api/starting-snippets
 * @description Create a new starting snippet.
 * @param {object} req.body - The starting snippet to create.
 * @returns {StartingSnippet} 201 - The newly created starting snippet.
 * @returns {object} 500 - An error object.
 */
app.post('/api/starting-snippets', async (req, res) => {
    try {
        const newSnippet = new StartingSnippet(req.body);
        await newSnippet.save();
        res.status(201).json(newSnippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @route DELETE /api/starting-snippets/:id
 * @description Delete a starting snippet.
 * @param {string} req.params.id - The ID of the starting snippet to delete.
 * @returns {void} 204 - No content.
 * @returns {object} 500 - An error object.
 */
app.delete('/api/starting-snippets/:id', async (req, res) => {
    try {
        await StartingSnippet.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/testing/clear-db', async (req, res) => {
    try {
        await Category.deleteMany({});
        await Snippet.deleteMany({});
        await Settings.deleteMany({});
        await StartingSnippet.deleteMany({});
        // Seed initial settings data if none exists
        Settings.findOne().then(settings => {
            if (!settings) {
                new Settings().save().then(() => console.log('Default settings created.'));
            }
        });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Catch-all for Frontend Routing ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../kolder-app/dist/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
