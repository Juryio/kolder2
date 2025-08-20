const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3001;
const DB_FILE = './db.json';

app.use(cors());
app.use(bodyParser.json());

const readDb = () => {
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API Endpoints for Categories ---

// GET all categories
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories);
});

// POST a new category
app.post('/api/categories', (req, res) => {
    const db = readDb();
    const newCategory = { ...req.body, id: Date.now() };

    if (req.body.parentId) {
        const addRec = (nodes) => {
            return nodes.map(node => {
                if (node.id === req.body.parentId) {
                    return { ...node, children: [...node.children, newCategory] };
                }
                if (node.children && node.children.length > 0) {
                    return { ...node, children: addRec(node.children) };
                }
                return node;
            });
        };
        db.categories = addRec(db.categories);
    } else {
        db.categories.push(newCategory);
    }

    writeDb(db);
    res.status(201).json(newCategory);
  });

// PUT (update) a category
app.put('/api/categories/:id', (req, res) => {
    const db = readDb();
    const categoryId = parseInt(req.params.id);
    const updatedData = req.body;

    const editRec = (nodes) => {
        return nodes.map(node => {
            if (node.id === categoryId) {
                return { ...node, name: updatedData.name };
            }
            if (node.children && node.children.length > 0) {
                return { ...node, children: editRec(node.children) };
            }
            return node;
        });
    };
    db.categories = editRec(db.categories);

    writeDb(db);
    res.json(updatedData);
});

// DELETE a category
app.delete('/api/categories/:id', (req, res) => {
    const db = readDb();
    const categoryId = parseInt(req.params.id);

    const getIdsToDelete = (nodes, parentId) => {
        let ids = [parentId];
        const node = nodes.find(n => n.id === parentId);
        if (node) {
            node.children.forEach(child => {
                ids = [...ids, ...getIdsToDelete(node.children, child.id)];
            });
        }
        return ids;
    }
    const findNode = (nodes, id) => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
    }

    let allIdsToDelete = [];
    const topLevelNode = db.categories.find(c => c.id === categoryId);
    if(topLevelNode) {
        allIdsToDelete = getIdsToDelete(db.categories, categoryId)
    } else {
        // search in children
        const findParent = (nodes, id) => {
            for(const node of nodes) {
                if(node.children.some(c => c.id === id)) return node;
                if(node.children) {
                    const found = findParent(node.children, id);
                    if(found) return found;
                }
            }
        }
        const parent = findParent(db.categories, categoryId);
        if(parent) {
            allIdsToDelete = getIdsToDelete(parent.children, categoryId);
        }
    }


    const deleteRec = (nodes) => {
        return nodes.filter(node => !allIdsToDelete.includes(node.id))
            .map(node => {
                if (node.children && node.children.length > 0) {
                    return { ...node, children: deleteRec(node.children) };
                }
                return node;
            });
    };

    db.categories = deleteRec(db.categories);
    db.snippets = db.snippets.filter(s => !allIdsToDelete.includes(s.categoryId));

    writeDb(db);
    res.status(204).send();
});


// --- API Endpoints for Snippets ---

// GET all snippets
app.get('/api/snippets', (req, res) => {
  const db = readDb();
  res.json(db.snippets);
});

// POST a new snippet
app.post('/api/snippets', (req, res) => {
  const db = readDb();
  const newSnippet = { ...req.body, id: Date.now() };
  db.snippets.push(newSnippet);
  writeDb(db);
  res.status(201).json(newSnippet);
});

// PUT (update) a snippet
app.put('/api/snippets/:id', (req, res) => {
  const db = readDb();
  const snippetId = parseInt(req.params.id);
  const updatedSnippet = req.body;
  db.snippets = db.snippets.map(s => (s.id === snippetId ? { ...s, ...updatedSnippet } : s));
  writeDb(db);
  res.json(updatedSnippet);
});

// DELETE a snippet
app.delete('/api/snippets/:id', (req, res) => {
  const db = readDb();
  const snippetId = parseInt(req.params.id);
  db.snippets = db.snippets.filter(s => s.id !== snippetId);
  writeDb(db);
  res.status(204).send();
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
