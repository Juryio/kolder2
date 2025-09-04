export const parsePlaceholders = (content) => {
  const placeholders = {
    text: new Set(),
    date: new Set(),
    choice: [],
  };

  if (!content) {
    return {
        text: [],
        date: [],
        choice: [],
    };
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
        // Avoid adding duplicates if the same choice placeholder is in the text multiple times
        if (!placeholders.choice.some(c => c.name === name)) {
            placeholders.choice.push({ name, displayType, options });
        }
      }
    } else {
      placeholders.text.add(expression);
    }
  }

  // Convert sets to arrays for easier use in components
  placeholders.text = Array.from(placeholders.text);
  placeholders.date = Array.from(placeholders.date);

  return placeholders;
};
