import { scanForPlaceholders } from './placeholder-scanner';

/**
 * Recursively parses a string to find all placeholders and their dependencies.
 * @param {string} content - The string to parse.
 * @returns {Array<object>} An array of placeholder objects.
 * @private
 */
const _recursiveParse = (content) => {
    if (!content) {
        return [];
    }

    const expressions = scanForPlaceholders(content);
    const results = [];

    for (const expression of expressions) {
        let placeholder;
        if (expression.startsWith('date:')) {
            // Use a regex that supports Unicode characters for the placeholder name.
            const nameMatch = expression.substring(5).match(/^([\p{L}\p{N}_]+)/u);
            if (nameMatch) {
                const name = nameMatch[1];
                placeholder = { type: 'date', name };
            }
        } else if (expression.startsWith('select:')) {
            const parts = expression.substring(7).split(':');
            const [name, displayType, ...options] = parts;
            // The name here is just split, so it should handle Unicode correctly.
            if (name && displayType && options.length > 0) {
                const nestedPlaceholders = options.flatMap(option => _recursiveParse(option));
                placeholder = { type: 'choice', name, displayType, options, children: nestedPlaceholders };
            }
        } else {
            placeholder = { type: 'text', name: expression };
        }

        if (placeholder) {
            results.push(placeholder);
        }
    }
    return results;
};

/**
 * Parses a string to find all placeholders and flattens the dependency tree.
 * @param {string} content - The string to parse.
 * @returns {{text: Array<string>, date: Array<string>, choice: Array<object>}} An object containing the found placeholders.
 */
export const parsePlaceholders = (content) => {
    const tree = _recursiveParse(content);

    const placeholders = {
        text: new Set(),
        date: new Set(),
        choice: [],
    };

    const flatten = (nodes) => {
        for (const node of nodes) {
            if (node.type === 'text') {
                placeholders.text.add(node.name);
            } else if (node.type === 'date') {
                placeholders.date.add(node.name);
            } else if (node.type === 'choice') {
                if (!placeholders.choice.some(c => c.name === node.name)) {
                    placeholders.choice.push({
                        name: node.name,
                        displayType: node.displayType,
                        options: node.options
                    });
                }
            }
            if (node.children) {
                flatten(node.children);
            }
        }
    };

    flatten(tree);

    return {
        text: Array.from(placeholders.text),
        date: Array.from(placeholders.date),
        choice: placeholders.choice,
    };
};
