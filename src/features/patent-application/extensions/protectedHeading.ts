import Heading from '@tiptap/extension-heading';

/**
 * ProtectedHeading is a Heading extension that renders all heading nodes with
 * `contenteditable="false"` so that users cannot modify or delete the text
 * inside section headers. This effectively makes header text immutable in the
 * editor while still keeping it part of the document structure.
 */
const ProtectedHeading = Heading.extend({
  addAttributes() {
    // Inherit attributes from the base Heading extension while not adding any
    // custom attributes of our own.
    // Using `this.parent?.()` is the canonical way in Tiptap v2 to inherit
    // attributes when extending an extension.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: parent might be undefined during type analysis but is defined at runtime.
    return {
      // @ts-ignore
      ...this.parent?.(),
    };
  },

  /**
   * Override default HTML renderer to mark headings as non-editable.
   */
  renderHTML({ node, HTMLAttributes }) {
    // Allow editing for the title (level-1) heading, but lock all others.
    const level = node.attrs.level;
    const attrs =
      level === 1
        ? HTMLAttributes
        : { ...HTMLAttributes, contenteditable: 'false' };

    return [`h${level}`, attrs, 0];
  },
});

export default ProtectedHeading;
