import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import PlaceholderChip from './PlaceholderChip';

export const PlaceholderNode = Node.create({
  name: 'placeholder',
  group: 'inline',
  inline: true,
  atom: true, // Prevents the user from editing the content of the node directly

  addAttributes() {
    return {
      name: {
        default: 'placeholder',
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => ({ 'data-name': attributes.name }),
      },
      type: {
        default: 'text',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => ({ 'data-type': attributes.type }),
      },
      // Add other attributes for dropdown options, date formats, etc.
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-placeholder]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-placeholder': '' }), `{{${HTMLAttributes['data-name']}}}`];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PlaceholderChip);
  },

  // Rule to automatically convert {{...}} into a placeholder node
  addInputRules() {
    return [
      new InputRule({
        find: /{{\s*(\w+)\s*}}$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const [start, end] = [range.from, range.to];
          const name = match[1];

          tr.replaceWith(start, end, this.type.create({ name }));
        },
      }),
    ];
  },
});
