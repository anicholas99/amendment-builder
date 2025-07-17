import React, { useReducer, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/useToastWrapper';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, PluginKey } from 'prosemirror-state';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';

interface FindReplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  initialSearchTerm?: string;
}

// State shape - grouped by logical concerns
interface FindReplacePanelState {
  // Search inputs
  inputs: {
    findText: string;
    replaceText: string;
  };

  // Search options
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
  };

  // Match tracking
  matches: {
    count: number;
    current: number;
  };

  // UI state
  ui: {
    showReplace: boolean;
    forceScroll: boolean;
  };
}

// Action types
type FindReplacePanelAction =
  // Input actions
  | { type: 'SET_FIND_TEXT'; payload: string }
  | { type: 'SET_REPLACE_TEXT'; payload: string }
  // Option actions
  | { type: 'TOGGLE_CASE_SENSITIVE' }
  | { type: 'TOGGLE_WHOLE_WORD' }
  | { type: 'SET_WHOLE_WORD'; payload: boolean }
  // Match actions
  | { type: 'SET_MATCH_COUNT'; payload: number }
  | { type: 'SET_CURRENT_MATCH'; payload: number }
  | { type: 'UPDATE_MATCHES'; payload: { count: number; current: number } }
  // UI actions
  | { type: 'TOGGLE_SHOW_REPLACE' }
  | { type: 'SET_FORCE_SCROLL'; payload: boolean }
  // Complex actions
  | { type: 'INIT_SEARCH'; payload: { findText: string; wholeWord: boolean } };

// Reducer function
function findReplacePanelReducer(
  state: FindReplacePanelState,
  action: FindReplacePanelAction
): FindReplacePanelState {
  switch (action.type) {
    // Input actions
    case 'SET_FIND_TEXT':
      return {
        ...state,
        inputs: { ...state.inputs, findText: action.payload },
      };
    case 'SET_REPLACE_TEXT':
      return {
        ...state,
        inputs: { ...state.inputs, replaceText: action.payload },
      };

    // Option actions
    case 'TOGGLE_CASE_SENSITIVE':
      return {
        ...state,
        options: {
          ...state.options,
          caseSensitive: !state.options.caseSensitive,
        },
      };
    case 'TOGGLE_WHOLE_WORD':
      return {
        ...state,
        options: { ...state.options, wholeWord: !state.options.wholeWord },
      };
    case 'SET_WHOLE_WORD':
      return {
        ...state,
        options: { ...state.options, wholeWord: action.payload },
      };

    // Match actions
    case 'SET_MATCH_COUNT':
      return { ...state, matches: { ...state.matches, count: action.payload } };
    case 'SET_CURRENT_MATCH':
      return {
        ...state,
        matches: { ...state.matches, current: action.payload },
      };
    case 'UPDATE_MATCHES':
      return { ...state, matches: action.payload };

    // UI actions
    case 'TOGGLE_SHOW_REPLACE':
      return {
        ...state,
        ui: { ...state.ui, showReplace: !state.ui.showReplace },
      };
    case 'SET_FORCE_SCROLL':
      return { ...state, ui: { ...state.ui, forceScroll: action.payload } };

    // Complex actions
    case 'INIT_SEARCH':
      return {
        ...state,
        inputs: { ...state.inputs, findText: action.payload.findText },
        options: { ...state.options, wholeWord: action.payload.wholeWord },
        matches: { ...state.matches, current: 0 },
        ui: { ...state.ui, forceScroll: true },
      };

    default:
      return state;
  }
}

// Plugin key for search decorations
const searchPluginKey = new PluginKey('searchHighlight');

export const FindReplacePanel: React.FC<FindReplacePanelProps> = ({
  isOpen,
  onClose,
  editor,
  initialSearchTerm,
}) => {
  // Initial state
  const initialState: FindReplacePanelState = {
    inputs: {
      findText: initialSearchTerm || '',
      replaceText: '',
    },
    options: {
      caseSensitive: false,
      wholeWord: false,
    },
    matches: {
      count: 0,
      current: 0,
    },
    ui: {
      showReplace: false,
      forceScroll: false,
    },
  };

  const [state, dispatch] = useReducer(findReplacePanelReducer, initialState);
  const toast = useToast();

  // Update search term when initialSearchTerm changes (triggered programmatically)
  useEffect(() => {
    if (
      isOpen &&
      initialSearchTerm &&
      initialSearchTerm !== state.inputs.findText
    ) {
      dispatch({
        type: 'INIT_SEARCH',
        payload: {
          findText: initialSearchTerm,
          wholeWord: true, // Ensure "Word" option is enabled for reference numeral searches
        },
      });
    }
  }, [isOpen, initialSearchTerm]); // Don't include state.inputs.findText as dependency

  // UI colors
  const bgColor = useColorModeValue('white', 'hsl(var(--card))');
  const borderColor = useColorModeValue(
    'hsl(var(--border))',
    'hsl(var(--border))'
  );
  const shadowColor = useColorModeValue('lg', 'dark-lg');

  // Clear search highlights
  const clearHighlights = useCallback(() => {
    if (!editor) return;

    const state = editor.state;
    const searchPlugin = state.plugins.find(
      p => p.spec.key === searchPluginKey
    );
    if (searchPlugin) {
      editor.unregisterPlugin(searchPluginKey);
    }
  }, [editor]);

  // Highlight all matches and return positions
  const highlightMatches = useCallback(() => {
    if (!editor || !state.inputs.findText) {
      clearHighlights();
      dispatch({ type: 'UPDATE_MATCHES', payload: { count: 0, current: 0 } });
      return [];
    }

    const { state: editorState } = editor;
    const { doc } = editorState;
    const decorations: Decoration[] = [];
    const matches: { from: number; to: number }[] = [];

    const searchRegex = new RegExp(
      state.options.wholeWord
        ? `\\b${state.inputs.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
        : state.inputs.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      state.options.caseSensitive ? 'g' : 'gi'
    );

    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        let match;
        while ((match = searchRegex.exec(node.text)) !== null) {
          const from = pos + match.index;
          const to = from + match[0].length;
          matches.push({ from, to });

          decorations.push(
            Decoration.inline(from, to, {
              class: 'search-result',
              style:
                'background-color: #ffeb3b; padding: 0 2px; border-radius: 2px;',
            })
          );
        }
      }
    });

    clearHighlights();

    if (decorations.length > 0) {
      const decorationSet = DecorationSet.create(doc, decorations);

      const searchPlugin = new Plugin({
        key: searchPluginKey,
        state: {
          init() {
            return decorationSet;
          },
          apply(tr) {
            return decorationSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      });

      editor.registerPlugin(searchPlugin);
    }

    dispatch({ type: 'SET_MATCH_COUNT', payload: matches.length });
    return matches;
  }, [
    editor,
    state.inputs.findText,
    state.options.caseSensitive,
    state.options.wholeWord,
    clearHighlights,
  ]);

  // Navigate to specific match
  const goToMatch = useCallback(
    (matches: { from: number; to: number }[], index: number) => {
      if (!editor || matches.length === 0 || index >= matches.length) return;

      const match = matches[index];

      // Clear any existing text selection to prevent blue highlights
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }

      // Ensure editor doesn't have any text selection
      editor.commands.setTextSelection(match.from);
      editor.commands.blur();

      const { doc } = editor.state;
      const decorations: Decoration[] = [];

      // Highlight all matches in yellow
      matches.forEach(m => {
        decorations.push(
          Decoration.inline(m.from, m.to, {
            class: 'search-result patent-search-highlight',
            style:
              'background-color: #ffeb3b !important; padding: 0 2px; border-radius: 2px; -webkit-user-select: none; user-select: none;',
          })
        );
      });

      clearHighlights();
      const decorationSet = DecorationSet.create(doc, decorations);

      const searchPlugin = new Plugin({
        key: searchPluginKey,
        state: {
          init() {
            return decorationSet;
          },
          apply(tr) {
            return decorationSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      });

      editor.registerPlugin(searchPlugin);

      // Ensure scrolling happens after selection and rendering
      // We need multiple steps with delays to ensure everything is ready

      // Step 1: Set the selection
      dispatch({ type: 'SET_CURRENT_MATCH', payload: index });

      // Step 2: After ensuring selection is set, manually adjust scroll within the editor container without focusing, to avoid browser auto-scroll.
      setTimeout(() => {
        try {
          // We intentionally avoid editor.commands.focus() and editor.commands.scrollIntoView() to prevent the page layout from shifting.

          // Direct DOM manipulation fallback
          const { view } = editor;
          const domAtPos = view.domAtPos(match.from);

          if (domAtPos && domAtPos.node) {
            const node = domAtPos.node;
            const element =
              node.nodeType === Node.TEXT_NODE
                ? node.parentElement
                : (node as HTMLElement);

            if (element) {
              logger.debug('[FindReplace] Found element to scroll to:', {
                tagName: element.tagName,
                className: element.className,
                text: element.textContent?.substring(0, 50),
              });

              // Get the editor's scrollable container
              const editorContainer = document.querySelector(
                '.patent-editor-tiptap'
              );
              if (!editorContainer) {
                logger.error(
                  '[FindReplace] Could not find .patent-editor-tiptap container'
                );
                return;
              }

              // Get positions
              const containerRect = editorContainer.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();

              // Check if element is already visible
              const isVisible =
                elementRect.top >= containerRect.top &&
                elementRect.bottom <= containerRect.bottom;

              if (!isVisible || state.ui.forceScroll) {
                // Calculate scroll position to center the element
                const scrollTop =
                  editorContainer.scrollTop +
                  (elementRect.top - containerRect.top) -
                  containerRect.height / 2 +
                  elementRect.height / 2;

                logger.debug('[FindReplace] Scrolling to position:', {
                  currentScroll: editorContainer.scrollTop,
                  targetScroll: scrollTop,
                  elementTop: elementRect.top,
                  containerTop: containerRect.top,
                });

                editorContainer.scrollTo({
                  top: Math.max(0, scrollTop),
                  behavior: 'smooth',
                });
              }
            }
          }

          // Reset force scroll flag
          if (state.ui.forceScroll) {
            dispatch({ type: 'SET_FORCE_SCROLL', payload: false });
          }
        } catch (e) {
          logger.error('[FindReplace] Scroll error:', e);
        }
      }, 50); // Small delay after selection
    },
    [editor, clearHighlights, state.ui.forceScroll]
  );

  // Update highlights when search parameters change
  useEffect(() => {
    if (isOpen && state.inputs.findText) {
      const matches = highlightMatches();
      // Don't navigate here - let the forceScroll effect handle initial navigation
    } else if (!isOpen) {
      clearHighlights();
    }
  }, [
    state.inputs.findText,
    state.options.caseSensitive,
    state.options.wholeWord,
    isOpen,
    highlightMatches,
    clearHighlights,
  ]);

  // Handle initial scroll when search is triggered programmatically
  useEffect(() => {
    if (state.ui.forceScroll && isOpen && state.inputs.findText) {
      // Small delay to ensure highlights are rendered
      const timer = setTimeout(() => {
        const matches = highlightMatches();
        if (matches.length > 0) {
          goToMatch(matches, 0);
        }
      }, 200); // Longer delay to ensure everything is ready

      return () => clearTimeout(timer);
    }
  }, [
    state.ui.forceScroll,
    isOpen,
    state.inputs.findText,
    highlightMatches,
    goToMatch,
  ]);

  // Clear when panel closes
  useEffect(() => {
    if (!isOpen) {
      clearHighlights();
      dispatch({ type: 'SET_FIND_TEXT', payload: '' });
      dispatch({ type: 'SET_REPLACE_TEXT', payload: '' });
      dispatch({ type: 'SET_CURRENT_MATCH', payload: 0 });
      dispatch({ type: 'TOGGLE_SHOW_REPLACE' });
    }
  }, [isOpen, clearHighlights]);

  const findNext = useCallback(() => {
    const matches = highlightMatches();
    if (matches.length === 0) return;

    const nextIndex = (state.matches.current + 1) % matches.length;
    dispatch({ type: 'SET_CURRENT_MATCH', payload: nextIndex });
    goToMatch(matches, nextIndex);
  }, [highlightMatches, state.matches.current, goToMatch]);

  const findPrevious = useCallback(() => {
    const matches = highlightMatches();
    if (matches.length === 0) return;

    const prevIndex =
      state.matches.current === 0
        ? matches.length - 1
        : state.matches.current - 1;
    dispatch({ type: 'SET_CURRENT_MATCH', payload: prevIndex });
    goToMatch(matches, prevIndex);
  }, [highlightMatches, state.matches.current, goToMatch]);

  const replaceCurrent = useCallback(() => {
    if (!editor || !state.inputs.findText || state.matches.count === 0) return;

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(
      selection.from,
      selection.to
    );

    if (
      selectedText === state.inputs.findText ||
      (!state.options.caseSensitive &&
        selectedText.toLowerCase() === state.inputs.findText.toLowerCase())
    ) {
      editor.chain().focus().insertContent(state.inputs.replaceText).run();

      setTimeout(() => {
        const matches = highlightMatches();
        if (matches.length > 0) {
          const nextIndex = Math.min(state.matches.current, matches.length - 1);
          dispatch({ type: 'SET_CURRENT_MATCH', payload: nextIndex });
          goToMatch(matches, nextIndex);
        }
      }, 100);
    }
  }, [
    editor,
    state.inputs.findText,
    state.inputs.replaceText,
    state.options.caseSensitive,
    state.matches.count,
    state.matches.current,
    highlightMatches,
    goToMatch,
  ]);

  const replaceAll = useCallback(() => {
    if (!editor || !state.inputs.findText || state.matches.count === 0) return;

    const { state: editorState } = editor;
    const { doc } = editorState;
    let offset = 0;
    let replacedCount = 0;

    const searchRegex = new RegExp(
      state.options.wholeWord
        ? `\\b${state.inputs.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
        : state.inputs.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      state.options.caseSensitive ? 'g' : 'gi'
    );

    const tr = editorState.tr;

    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        let match;
        const matches = [];

        while ((match = searchRegex.exec(node.text)) !== null) {
          matches.push({
            from: pos + match.index,
            to: pos + match.index + match[0].length,
            length: match[0].length,
          });
        }

        for (let i = matches.length - 1; i >= 0; i--) {
          const m = matches[i];
          tr.replaceWith(
            m.from + offset,
            m.to + offset,
            editor.schema.text(state.inputs.replaceText)
          );
          offset += state.inputs.replaceText.length - m.length;
          replacedCount++;
        }
      }
    });

    editor.view.dispatch(tr);

    toast({
      title: `Replaced ${replacedCount} occurrences`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });

    clearHighlights();
    dispatch({ type: 'UPDATE_MATCHES', payload: { count: 0, current: 0 } });
  }, [
    editor,
    state.inputs.findText,
    state.inputs.replaceText,
    state.options.caseSensitive,
    state.options.wholeWord,
    state.matches.count,
    clearHighlights,
    toast,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        findNext();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        findPrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, findNext, findPrevious, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-4 right-4 z-1000"
      style={{
        backgroundColor: bgColor,
        borderRadius: 'md',
        border: `1px solid ${borderColor}`,
        boxShadow: shadowColor,
        padding: '1rem',
        minWidth: '350px',
        maxWidth: '400px',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-semibold">Find & Replace</span>
          <Button
            aria-label="Toggle replace"
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'TOGGLE_SHOW_REPLACE' })}
          >
            {state.ui.showReplace ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          aria-label="Close"
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <Input
          value={state.inputs.findText}
          onChange={e =>
            dispatch({ type: 'SET_FIND_TEXT', payload: e.target.value })
          }
          placeholder="Find..."
          autoFocus
          className="h-9 text-sm"
        />
        <Button
          size="sm"
          onClick={findPrevious}
          disabled={state.matches.count === 0}
        >
          ↑
        </Button>
        <Button
          size="sm"
          onClick={findNext}
          disabled={state.matches.count === 0}
        >
          ↓
        </Button>
      </div>

      <Collapsible open={state.ui.showReplace}>
        <CollapsibleContent>
          <div className="mt-4 flex items-center space-x-2">
            <Input
              value={state.inputs.replaceText}
              onChange={e =>
                dispatch({ type: 'SET_REPLACE_TEXT', payload: e.target.value })
              }
              placeholder="Replace with..."
              className="h-9 text-sm"
            />
            <Button
              size="sm"
              onClick={replaceCurrent}
              disabled={state.matches.count === 0}
              className="flex-1"
            >
              Replace
            </Button>
            <Button
              size="sm"
              onClick={replaceAll}
              disabled={state.matches.count === 0}
              className="bg-purple-500 text-white flex-1"
            >
              Replace All
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={state.options.caseSensitive}
              onCheckedChange={checked => {
                if (checked !== 'indeterminate') {
                  dispatch({ type: 'TOGGLE_CASE_SENSITIVE' });
                }
              }}
            />
            <span>Case</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={state.options.wholeWord}
              onCheckedChange={checked => {
                if (checked !== 'indeterminate') {
                  dispatch({ type: 'TOGGLE_WHOLE_WORD' });
                }
              }}
            />
            <span>Word</span>
          </label>
        </div>
        {state.inputs.findText && (
          <span className="text-text-secondary">
            {state.matches.count > 0
              ? `${state.matches.current + 1}/${state.matches.count}`
              : 'No matches'}
          </span>
        )}
      </div>
    </div>
  );
};
