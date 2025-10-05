const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { Category, Snippet, Settings, StartingSnippet } = require('./models');
const EmbeddingService = require('./embedding-service');
const GenerationService = require('./generation-service');

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
 * Builds a tree structure from a flat list of categories in an efficient O(n) way.
 * @param {Array<Category>} categories - The flat list of categories from the database.
 * @returns {Array<Category>} A tree of categories, where each category object has a `children` property.
 */
const buildTree = (categories) => {
    const map = {};
    const roots = [];

    // First pass: create a map of all nodes
    categories.forEach(cat => {
        map[cat._id] = { ...cat.toObject(), children: [] };
    });

    // Second pass: link children to their parents
    categories.forEach(cat => {
        if (cat.parentId && map[cat.parentId]) {
            map[cat.parentId].children.push(map[cat._id]);
        } else {
            roots.push(map[cat._id]);
        }
    });

    return roots;
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
        const { name, content, categoryId, tags } = req.body;

        // Combine name and content for a richer embedding
        const textToEmbed = `${name}\n${content}`;
        const embedding = await EmbeddingService.generateEmbedding(textToEmbed);

        const newSnippet = new Snippet({
            name,
            content,
            categoryId,
            tags: tags || [],
            embedding: embedding,
        });
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
        const { name, content, categoryId, tags } = req.body;
        const update = {};

        if (name !== undefined) update.name = name;
        if (content !== undefined) update.content = content;
        if (categoryId !== undefined) update.categoryId = categoryId;
        if (tags !== undefined) update.tags = tags;

        // If the name or content is being updated, regenerate the embedding
        if (name !== undefined || content !== undefined) {
            // We need the full text, so fetch the original if one part is missing
            const originalSnippet = await Snippet.findById(req.params.id);
            const textToEmbed = `${name || originalSnippet.name}\n${content || originalSnippet.content}`;
            update.embedding = await EmbeddingService.generateEmbedding(textToEmbed);
        }

        const updatedSnippet = await Snippet.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
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


// --- Search ---

/**
 * Calculates the cosine similarity between two vectors.
 * @param {Array<number>} vecA - The first vector.
 * @param {Array<number>} vecB - The second vector.
 * @returns {number} The cosine similarity score (between -1 and 1).
 */
const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * @route GET /api/search
 * @description Search for snippets using a hybrid keyword and semantic approach.
 * @param {string} req.query.q - The search query.
 * @returns {Array<Snippet>} 200 - A list of ranked snippets.
 * @returns {object} 500 - An error object.
 */
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.json([]);
        }

        // --- Phase 1: Keyword Filtering ---
        // First, try a fast keyword-based search.
        let keywordResults = await Snippet.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        ).lean();

        // --- Phase 2: Fallback to Full Semantic Search ---
        // If keyword search yields no results, perform a full semantic search across all snippets.
        // This is the key to finding relevant results even without matching keywords.
        if (keywordResults.length === 0) {
            console.log('Keyword search returned no results. Falling back to full semantic search.');
            const allSnippets = await Snippet.find({ embedding: { $exists: true, $ne: null } }).lean();
            if (allSnippets.length === 0) {
                return res.json([]); // No snippets have embeddings, so can't search
            }

            const queryEmbedding = await EmbeddingService.generateEmbedding(q);

            const semanticResults = allSnippets.map(snippet => ({
                ...snippet,
                hybridScore: cosineSimilarity(queryEmbedding, snippet.embedding) // Score is purely semantic
            }));

            // Sort by score and return the top N results. This is more robust
            // than a fixed threshold, as it always returns the most likely candidates.
            const relevantResults = semanticResults
                .sort((a, b) => b.hybridScore - a.hybridScore)
                .slice(0, 10); // Return the top 10 results

            return res.json(relevantResults);
        }

        // --- Phase 3: Rank Hybrid Results ---
        // If we have keyword results, we enrich them with a semantic score for a hybrid ranking.
        const queryEmbedding = await EmbeddingService.generateEmbedding(q);

        const rankedResults = keywordResults.map(snippet => {
            const semanticScore = snippet.embedding ? cosineSimilarity(queryEmbedding, snippet.embedding) : 0;
            const textScore = snippet.score || 0;

            // Weighted average: 70% semantic, 30% keyword. This can be tuned.
            const hybridScore = (0.7 * semanticScore) + (0.3 * textScore);

            return { ...snippet, hybridScore };
        });

        // Sort by the final hybrid score
        rankedResults.sort((a, b) => b.hybridScore - a.hybridScore);

        res.json(rankedResults);

    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'An error occurred during the search.' });
    }
});

/**
 * @route POST /api/snippets/reindex-all
 * @description Manually trigger re-indexing for all snippets in the database.
 * @returns {object} 200 - A success message with the count of re-indexed snippets.
 * @returns {object} 500 - An error object.
 */
app.post('/api/snippets/reindex-all', async (req, res) => {
    try {
        console.log('Starting re-indexing for all snippets...');
        const snippets = await Snippet.find({ embedding: { $exists: false } });
        let updatedCount = 0;

        for (const snippet of snippets) {
            const textToEmbed = `${snippet.name}\n${snippet.content}`;
            snippet.embedding = await EmbeddingService.generateEmbedding(textToEmbed);
            await snippet.save();
            updatedCount++;
        }

        console.log(`Re-indexing complete. Updated ${updatedCount} snippets.`);
        res.status(200).json({ message: `Successfully re-indexed ${updatedCount} snippets.` });
    } catch (err) {
        console.error('Re-indexing error:', err);
        res.status(500).json({ error: 'An error occurred during re-indexing.' });
    }
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


// --- AI Services ---

/**
 * @route POST /api/text/generate
 * @description Generates transformed text using the T5 model.
 * @param {object} req.body - The request body.
 * @param {string} req.body.text - The input text to transform.
 * @param {string} req.body.task - The task to perform (e.g., "formalize").
 * @returns {object} 200 - An object containing the generated text.
 * @returns {object} 400 - An error object if the input is invalid.
 * @returns {object} 500 - An error object.
 */
app.post('/api/text/generate', async (req, res) => {
    try {
        const { text, task } = req.body;

        if (!text || !task) {
            return res.status(400).json({ error: 'Missing "text" or "task" in request body.' });
        }

        let taskPrefix;
        switch (task) {
            case 'formalize':
                // Use a concise, direct command for the model
                taskPrefix = 'formalize: ';
                break;
            case 'correct-grammar':
                taskPrefix = 'grammar: ';
                break;
            case 'summarize':
                taskPrefix = 'summarize: ';
                break;
            case 'bullet-points':
                taskPrefix = 'generate bullet points: ';
                break;
            default:
                return res.status(400).json({ error: 'Unsupported task.' });
        }

        const generatedText = await GenerationService.generate(text, taskPrefix);

        if (generatedText) {
            res.json({ generatedText });
        } else {
            res.status(500).json({ error: 'Failed to generate text.' });
        }

    } catch (err) {
        console.error('Text generation error:', err);
        res.status(500).json({ error: 'An error occurred during text generation.' });
    }
});


// --- Debug Endpoints ---

/**
 * @route GET /api/debug/export
 * @description Export all data from the database as a single JSON object.
 * @returns {object} 200 - An object containing all data from the database.
 * @returns {object} 500 - An error object.
 */
app.get('/api/debug/export', async (req, res) => {
    try {
        const categories = await Category.find();
        const snippets = await Snippet.find();
        const settings = await Settings.find();
        const startingSnippets = await StartingSnippet.find();

        const data = {
            categories,
            snippets,
            settings,
            startingSnippets,
        };

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route POST /api/debug/import
 * @description Import data from a JSON object, overwriting existing data.
 * @param {object} req.body - The JSON object containing the data to import.
 * @returns {object} 200 - A success message.
 * @returns {object} 500 - An error object.
 */
app.post('/api/debug/import', async (req, res) => {
    try {
        const { categories, snippets, settings, startingSnippets } = req.body;

        // Clear existing data
        await Category.deleteMany({});
        await Snippet.deleteMany({});
        await Settings.deleteMany({});
        await StartingSnippet.deleteMany({});

        // Insert new data
        if (categories) await Category.insertMany(categories);
        if (snippets) await Snippet.insertMany(snippets);
        if (settings) await Settings.insertMany(settings);
        if (startingSnippets) await StartingSnippet.insertMany(startingSnippets);

        res.status(200).json({ message: 'Data imported successfully.' });
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
