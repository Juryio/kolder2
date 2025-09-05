import { scanForPlaceholders } from './placeholder-scanner';

/**
 * Recursively parses a string to find all placeholders and adds them to the provided placeholders object.
 * This function is not exported and is only used by `parsePlaceholders`.
 * @param {string} content - The string to parse.
 * @param {object} placeholders - The object to store the found placeholders.
 * @param {Set<string>} placeholders.text - A set of text placeholders.
 * @param {Set<string>} placeholders.date - A set of date placeholders.
 * @param {Array<object>} placeholders.choice - An array of choice placeholders.
 * @private
 */
const _recursiveParse = (content, placeholders) => {
    if (!content) {
        return;
    }

    const expressions = scanForPlaceholders(content);
    for (const expression of expressions) {
        if (expression.startsWith('date:')) {
            const name = expression.substring(5).split(' ')[0];
            if (name) placeholders.date.add(name);
        } else if (expression.startsWith('select:')) {
            const parts = expression.substring(7).split(':');
            const [name, displayType, ...options] = parts;
            if (name && displayType && options.length > 0) {
                if (!placeholders.choice.some(c => c.name === name)) {
                    placeholders.choice.push({ name, displayType, options });
                    // Recursively parse the options themselves for more placeholders
                    options.forEach(option => _recursiveParse(option, placeholders));
                }
            }
        } else {
            placeholders.text.add(expression);
        }
    }
};

/**
 * Parses a string to find all placeholders.
 * Placeholders are defined by the syntax `[[placeholder]]`.
 * There are three types of placeholders:
 * - Text: `[[name]]`
 * - Date: `[[date:name]]`
 * - Choice: `[[select:name:displayType:option1:option2]]`
 * @param {string} content - The string to parse.
 * @returns {{text: Array<string>, date: Array<string>, choice: Array<object>}} An object containing the found placeholders.
 */
export const parsePlaceholders = (content) => {
    const placeholders = {
        text: new Set(),
        date: new Set(),
        choice: [],
    };

    _recursiveParse(content, placeholders);

    // Convert sets to arrays for easier use in components
    placeholders.text = Array.from(placeholders.text);
    placeholders.date = Array.from(placeholders.date);

    return placeholders;
};
