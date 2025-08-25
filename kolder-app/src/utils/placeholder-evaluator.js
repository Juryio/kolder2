import { add, sub, format } from 'date-fns';

const placeholderRegex = /{{\s*([^}]+)\s*}}/g;
// Regex to parse: variable, operator, amount, unit
// e.g., "date:invoice_date + 10 d"
const expressionRegex = /^date:(\w+)(?:\s*([+-])\s*(\d+)\s*([dwmy]))?$/;

export const evaluatePlaceholders = (text, dateValues) => {
  if (!text || !dateValues) {
    return text;
  }

  return text.replace(placeholderRegex, (match, expression) => {
    const parts = expression.trim().match(expressionRegex);

    if (!parts) {
      return match; // If expression is invalid, return the original placeholder
    }

    const [, variable, operator, amountStr, unit] = parts;

    if (!dateValues[variable]) {
      // If the base date variable hasn't been set, indicate it.
      return `{{${variable}: Unset}}`;
    }

    try {
      let baseDate = new Date(dateValues[variable]);

      if (operator && amountStr && unit) {
        const amount = parseInt(amountStr, 10);
        const duration = {};

        switch (unit) {
          case 'd': duration.days = amount; break;
          case 'w': duration.weeks = amount; break;
          case 'm': duration.months = amount; break;
          case 'y': duration.years = amount; break;
          default: return match; // Invalid unit
        }

        if (operator === '+') {
          baseDate = add(baseDate, duration);
        } else if (operator === '-') {
          baseDate = sub(baseDate, duration);
        }
      }

      // Using format for consistent output, e.g., "25.08.2025"
      return format(baseDate, 'dd.MM.yyyy');

    } catch (error) {
      console.error("Error evaluating placeholder:", error);
      return match; // Return original on error
    }
  });
};
