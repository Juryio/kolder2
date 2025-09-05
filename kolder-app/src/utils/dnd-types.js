/**
 * @file Defines the types of items that can be dragged and dropped in the application.
 * This is used by `react-dnd` to distinguish between different draggable components.
 */

/**
 * An object containing the types of draggable items.
 * @const
 * @type {{CATEGORY: string, SNIPPET: string}}
 */
export const ItemTypes = {
  CATEGORY: 'category',
  SNIPPET: 'snippet',
};
