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
 * Handles text, date, and choice placeholders.
 * @param {string} expression - The placeholder expression (the content between `{{` and `}}`).
 * @param {object} values - The object containing the placeholder values.
 * @returns {string} The evaluated value of the placeholder.
 * @private
 */
const evaluateExpression = (expression, values) => {
    expression = expression.trim();

    // --- PASS 1: Structural Placeholders ---
    if (expression.startsWith('select:')) {
        const selectExpressionRegex = /^select:(\w+):/;
        const parts = expression.match(selectExpressionRegex);
        if (!parts) return `{{${expression}}}`;

        const variable = parts[1];
        // Recursively render the result of the choice
        return renderPlaceholders(values.choice?.[variable] || '', values);
    }

    // --- PASS 2: Value Placeholders ---
    if (expression.startsWith('date:')) {
        const dateExpressionRegex = /^date:(\w+)(?:\s*([+-])\s*(\d+)\s*([dwmy]))?$/;
        const parts = expression.match(dateExpressionRegex);
        if (!parts) return `{{${expression}}}`;

        const [, variable, operator, amountStr, unit] = parts;
        const baseDateValue = values.date?.[variable];

        if (!baseDateValue) return `{{${variable}: Unset}}`;

        try {
            let baseDate = new Date(baseDateValue);
            if (operator && amountStr && unit) {
                const amount = parseInt(amountStr, 10);
                const duration = {};
                switch (unit) {
                    case 'd': duration.days = amount; break;
                    case 'w': duration.weeks = amount; break;
                    case 'm': duration.months = amount; break;
                    case 'y': duration.years = amount; break;
                    default: return `{{${expression}}}`;
                }
                if (operator === '+') baseDate = add(baseDate, duration);
                else if (operator === '-') baseDate = sub(baseDate, duration);
            }
            return format(baseDate, 'dd.MM.yyyy');
        } catch (error) {
            return `{{${expression}}}`;
        }
    }

    // Simple text placeholder
    return values.text?.[expression] || '';
};

/**
 * Renders a string containing placeholders with the provided values.
 * Placeholders are defined by the syntax `{{placeholder}}`.
 * @param {string} content - The string to render.
 * @param {object} values - The object containing the placeholder values.
 * @param {object} values.text - An object mapping text placeholder names to their values.
 * @param {object} values.date - An object mapping date placeholder names to their values.
 * @param {object} values.choice - An object mapping choice placeholder names to their selected option's value.
 * @returns {string} The rendered string with placeholders replaced by their values.
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
            // Unmatched opening bracket, just append the rest of the string and stop
            result += content.substring(openPos);
            break;
        }
    }

    return result;
};
