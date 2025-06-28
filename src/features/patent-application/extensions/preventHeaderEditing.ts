import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

/**
 * PreventHeaderEditing
 * A ProseMirror/Tiptap extension that blocks any document-changing
 * transactions when the current selection is inside a heading node. This
 * effectively makes the text content of all headings immutable while still
 * allowing users to click, select, and navigate through them.
 */
export const PreventHeaderEditing = Extension.create({
  name: 'preventHeaderEditing',

  priority: 1000, // Execute early to block before other extensions

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction: (tr, state) => {
          // Only block transactions that change the document
          if (!tr.docChanged) {
            return true;
          }

          const { selection } = state;
          const { $from } = selection;

          // If selection is inside a heading node, disallow the transaction
          if ($from.parent.type.name === 'heading') {
            // Allow editing for level-1 heading (document title)
            const level = $from.parent.attrs?.level || 1;
            if (level !== 1) {
              return false;
            }
          }

          // Otherwise allow
          return true;
        },
      }),
    ];
  },
}); 