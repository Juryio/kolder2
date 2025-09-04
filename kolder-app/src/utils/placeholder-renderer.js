import { add, sub, format } from 'date-fns';

// This new renderer will handle all placeholder types using a two-pass system.
export const renderPlaceholders = (content, values) => {
  if (!content) {
    return '';
  }

  const placeholderRegex = /{{\s*([^}]+)\s*}}/g;

  // --- PASS 1: Resolve structural placeholders (e.g., select) ---
  const pass1Content = content.replace(placeholderRegex, (match, expression) => {
    expression = expression.trim();

    if (expression.startsWith('select:')) {
      const selectExpressionRegex = /^select:(\w+):/;
      const parts = expression.match(selectExpressionRegex);
      if (!parts) return match; // Invalid select expression

      const variable = parts[1];
      return values.choice?.[variable] || ''; // Return selected value or empty string
    }

    // If it's not a structural placeholder, leave it for the next pass
    return match;
  });


  // --- PASS 2: Resolve value placeholders (e.g., text, date) ---
  const pass2Content = pass1Content.replace(placeholderRegex, (match, expression) => {
    expression = expression.trim();

    // Handle 'date:' placeholders
    if (expression.startsWith('date:')) {
      const dateExpressionRegex = /^date:(\w+)(?:\s*([+-])\s*(\d+)\s*([dwmy]))?$/;
      const parts = expression.match(dateExpressionRegex);
      if (!parts) return match; // Invalid date expression

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
            default: return match;
          }
          if (operator === '+') baseDate = add(baseDate, duration);
          else if (operator === '-') baseDate = sub(baseDate, duration);
        }
        return format(baseDate, 'dd.MM.yyyy');
      } catch (error) {
        return match; // Return original on error
      }
    }

    // Handle simple text placeholders
    // Note: 'select:' placeholders were already handled in pass 1, so we don't need to check for them here.
    return values.text?.[expression] || ''; // Return value or empty string
  });

  return pass2Content;
};
