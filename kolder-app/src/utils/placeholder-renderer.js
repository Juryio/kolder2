import { add, sub, format } from 'date-fns';

const evaluateValuePlaceholder = (expression, values) => {
    expression = expression.trim();

    // Handle 'date:' placeholders
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

    // Handle simple text placeholders
    return values.text?.[expression] || '';
};

const evaluateStructuralPlaceholder = (expression, values) => {
    expression = expression.trim();

    if (expression.startsWith('select:')) {
        const selectExpressionRegex = /^select:(\w+):/;
        const parts = expression.match(selectExpressionRegex);
        if (!parts) return `{{${expression}}}`;

        const variable = parts[1];
        return values.choice?.[variable] || '';
    }

    // For any other placeholder type in Pass 1, just return it as is.
    return `{{${expression}}}`;
};


// This new renderer will handle all placeholder types using a two-pass system.
export const renderPlaceholders = (content, values) => {
    if (!content) {
        return '';
    }

    const placeholderRegex = /{{\s*([^}]+?)\s*}}/g;

    // --- PASS 1: Resolve structural placeholders (e.g., select) ---
    const pass1Content = content.replace(placeholderRegex, (match, expression) => {
        return evaluateStructuralPlaceholder(expression, values);
    });

    // --- PASS 2: Resolve value placeholders (e.g., text, date) ---
    const pass2Content = pass1Content.replace(placeholderRegex, (match, expression) => {
        // If a select placeholder still exists (e.g., one was not selected), don't evaluate it as a value.
        if (expression.trim().startsWith('select:')) {
            return '';
        }
        return evaluateValuePlaceholder(expression, values);
    });

    return pass2Content;
};
