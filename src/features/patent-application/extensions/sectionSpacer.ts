import { Node } from '@tiptap/core';

/**
 * SectionSpacer is a custom node that preserves the spacing divs
 * between patent sections. These are non-editable structural elements.
 */
const SectionSpacer = Node.create({
  name: 'sectionSpacer',

  group: 'block',

  atom: true,

  selectable: false,

  parseHTML() {
    return [
      {
        tag: 'div.section-spacer',
      },
    ];
  },

  renderHTML() {
    return ['div', { class: 'section-spacer', contenteditable: 'false' }];
  },

  addNodeView() {
    return () => {
      const dom = document.createElement('div');
      dom.classList.add('section-spacer');
      dom.contentEditable = 'false';

      return {
        dom,
      };
    };
  },
});

export default SectionSpacer;
