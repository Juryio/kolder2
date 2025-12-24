import { add, sub, format } from 'date-fns';

/**
 * Finds the matching closing `}}` for an opening `{{` accounting for nested placeholders.
 * @param {string} content - The string to search within.
 * @param {number} start - The starting index after the initial `{{`.
 * @returns {number} The index of the matching `}}` or -1 if not found.
 * @private
 */
const findMatchingBrackets = (content, start) => {
    let depth = 1;
    for (let i = start; i < content.length - 1; i++) {
        if (content.substring(i, i + 2) === '{{') {
            depth++;
            i++;
        } else if (content.substring(i, i + 2) === '}}') {
            depth--;
            if (depth === 0) {
                return i;
            }
            i++;
        }
    }
    return -1; // Not found
};

/**
 * Evaluates a single placeholder expression and returns the corresponding value.
 * @param {string} expression - The placeholder expression.
 * @param {object} values - The placeholder values.
 * @returns {string} The evaluated value.
 * @private
 */
const evaluateExpression = (expression, values) => {
    expression = expression.trim();

    if (expression.startsWith('select:')) {
        // Use a regex that supports Unicode characters for the placeholder name.
        const selectExpressionRegex = /^select:([\p{L}\p{N}_]+):/u;
        const parts = expression.match(selectExpressionRegex);
        if (!parts) return `{{${expression}}}`;
        const variable = parts[1];
        return renderPlaceholders(values.choice?.[variable] || '', values);
    }

    if (expression.startsWith('date:')) {
        // Use a regex that supports Unicode characters for the placeholder name.
        const dateExpressionRegex = /^date:([\p{L}\p{N}_]+)((?:[+-]\d+[dwmy])+)?$/u;
        const parts = expression.match(dateExpressionRegex);
        if (!parts) return `{{${expression}}}`;

        const [, variable, allMods] = parts;
        const baseDateValue = values.date?.[variable];

        if (!baseDateValue) return `{{${variable}: Unset}}`;

        try {
            let baseDate = new Date(baseDateValue);
            if (allMods) {
                const modRegex = /([+-])(\d+)([dwmy])/g;
                let match;
                while ((match = modRegex.exec(allMods)) !== null) {
                    const [, operator, amountStr, unit] = match;
                    const amount = parseInt(amountStr, 10);
                    const duration = {};
                    switch (unit) {
                        case 'd': duration.days = amount; break;
                        case 'w': duration.weeks = amount; break;
                        case 'm': duration.months = amount; break;
                        case 'y': duration.years = amount; break;
                    }
                    if (operator === '+') baseDate = add(baseDate, duration);
                    else if (operator === '-') baseDate = sub(baseDate, duration);
                }
            }
            return format(baseDate, 'dd.MM.yyyy');
        } catch (error) {
            return `{{${expression}}}`;
        }
    }

    // For text placeholders, the name is the entire expression.
    // It should also correctly handle Unicode characters.
    return values.text?.[expression] || '';
};

/**
 * Renders a string containing placeholders with the provided values.
 * @param {string} content - The string to render.
 * @param {object} values - The object containing the placeholder values.
 * @returns {string} The rendered string.
 */
export const renderPlaceholders = (content, values) => {
    if (!content) {
        return '';
    }

    let result = '';
    let currentIndex = 0;

    while (currentIndex < content.length) {
        const openPos = content.indexOf('{{', currentIndex);
        if (openPos === -1) {
            result += content.substring(currentIndex);
            break;
        }

        result += content.substring(currentIndex, openPos);
        const closePos = findMatchingBrackets(content, openPos + 2);

        if (closePos !== -1) {
            const expression = content.substring(openPos + 2, closePos);
            result += evaluateExpression(expression, values);
            currentIndex = closePos + 2;
        } else {
            result += content.substring(openPos);
            break;
        }
    }

    return result;
};
