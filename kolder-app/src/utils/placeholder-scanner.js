export const scanForPlaceholders = (content) => {
    const placeholders = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
        const openPos = content.indexOf('{{', currentIndex);
        if (openPos === -1) {
            break; // No more placeholders
        }

        let depth = 1;
        let closePos = -1;

        for (let i = openPos + 2; i < content.length - 1; i++) {
            if (content.substring(i, i + 2) === '{{') {
                depth++;
                i++; // Skip the second character of the delimiter
            } else if (content.substring(i, i + 2) === '}}') {
                depth--;
                if (depth === 0) {
                    closePos = i;
                    break;
                }
                i++; // Skip the second character of the delimiter
            }
        }

        if (closePos !== -1) {
            // Extract the expression inside the top-level placeholder
            const expression = content.substring(openPos + 2, closePos).trim();
            placeholders.push(expression);
            currentIndex = closePos + 2;
        } else {
            // Unmatched opening bracket, stop scanning
            break;
        }
    }

    return placeholders;
};
