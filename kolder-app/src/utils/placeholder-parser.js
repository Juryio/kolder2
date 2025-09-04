const _recursiveParse = (content, placeholders) => {
    if (!content) {
        return;
    }

    const placeholderRegex = /{{\s*([^}]+)\s*}}/g;
    for (const match of content.matchAll(placeholderRegex)) {
        const expression = match[1].trim();

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
