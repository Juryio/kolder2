import { add, sub, format } from 'date-fns';

// This new renderer will handle all placeholder types.
export const renderPlaceholders = (content, values) => {
  if (!content) {
    return '';
  }

  const placeholderRegex = /{{\s*([^}]+)\s*}}/g;

  return content.replace(placeholderRegex, (match, expression) => {
    expression = expression.trim();

    // 1. Handle 'date:' placeholders
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

    // 2. Handle 'select:' placeholders
    if (expression.startsWith('select:')) {
      const selectExpressionRegex = /^select:(\w+):/;
      const parts = expression.match(selectExpressionRegex);
      if (!parts) return match; // Invalid select expression

      const variable = parts[1];
      return values.choice?.[variable] || ''; // Return selected value or empty string
    }

    // 3. Handle simple text placeholders
    return values.text?.[expression] || ''; // Return value or empty string
  });
};
