import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  HStack,
  VStack,
  Text,
  Checkbox,
  IconButton,
  useToast,
  Collapse,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Editor } from '@tiptap/react';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, PluginKey } from 'prosemirror-state';

interface FindReplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

// Plugin key for search decorations
const searchPluginKey = new PluginKey('searchHighlight');

export const FindReplacePanel: React.FC<FindReplacePanelProps> = ({
  isOpen,
  onClose,
  editor,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  const toast = useToast();

  // UI colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
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
    if (!editor || !findText) {
      clearHighlights();
      setMatchCount(0);
      setCurrentMatch(0);
      return [];
    }

    const { state } = editor;
    const { doc } = state;
    const decorations: Decoration[] = [];
    const matches: { from: number; to: number }[] = [];

    const searchRegex = new RegExp(
      wholeWord
        ? `\\b${findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
        : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      caseSensitive ? 'g' : 'gi'
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

    setMatchCount(matches.length);
    return matches;
  }, [editor, findText, caseSensitive, wholeWord, clearHighlights]);

  // Navigate to specific match
  const goToMatch = useCallback(
    (matches: { from: number; to: number }[], index: number) => {
      if (!editor || matches.length === 0 || index >= matches.length) return;

      const match = matches[index];
      editor.commands.setTextSelection({ from: match.from, to: match.to });

      const { doc } = editor.state;
      const decorations: Decoration[] = [];

      matches.forEach((m, i) => {
        if (i === index) {
          decorations.push(
            Decoration.inline(m.from, m.to, {
              class: 'search-result-current',
              style:
                'background-color: #ff9800; padding: 0 2px; border-radius: 2px; color: white;',
            })
          );
        } else {
          decorations.push(
            Decoration.inline(m.from, m.to, {
              class: 'search-result',
              style:
                'background-color: #ffeb3b; padding: 0 2px; border-radius: 2px;',
            })
          );
        }
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

      // Only scroll into view if the selection is not already visible
      const { view } = editor;
      const coords = view.coordsAtPos(match.from);
      const editorElement = view.dom as HTMLElement;
      const scrollContainer = editorElement.closest('.custom-scrollbar') || 
                             editorElement.parentElement;
      
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const isVisible = coords.top >= containerRect.top && 
                         coords.bottom <= containerRect.bottom;
        
        // Only scroll if not visible
        if (!isVisible) {
          editor.commands.scrollIntoView();
        }
      } else {
        // Fallback if no scroll container found
        editor.commands.scrollIntoView();
      }

      setCurrentMatch(index);
    },
    [editor, clearHighlights]
  );

  // Update highlights when search parameters change
  useEffect(() => {
    if (isOpen) {
      const matches = highlightMatches();
      if (matches.length > 0 && currentMatch < matches.length) {
        goToMatch(matches, currentMatch);
      }
    } else {
      clearHighlights();
    }
  }, [
    findText,
    caseSensitive,
    wholeWord,
    isOpen,
    highlightMatches,
    currentMatch,
    goToMatch,
    clearHighlights,
  ]);

  // Clear when panel closes
  useEffect(() => {
    if (!isOpen) {
      clearHighlights();
      setFindText('');
      setReplaceText('');
      setCurrentMatch(0);
      setShowReplace(false);
    }
  }, [isOpen, clearHighlights]);

  const findNext = useCallback(() => {
    const matches = highlightMatches();
    if (matches.length === 0) return;

    const nextIndex = (currentMatch + 1) % matches.length;
    setCurrentMatch(nextIndex);
    goToMatch(matches, nextIndex);
  }, [highlightMatches, currentMatch, goToMatch]);

  const findPrevious = useCallback(() => {
    const matches = highlightMatches();
    if (matches.length === 0) return;

    const prevIndex =
      currentMatch === 0 ? matches.length - 1 : currentMatch - 1;
    setCurrentMatch(prevIndex);
    goToMatch(matches, prevIndex);
  }, [highlightMatches, currentMatch, goToMatch]);

  const replaceCurrent = useCallback(() => {
    if (!editor || !findText || matchCount === 0) return;

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(
      selection.from,
      selection.to
    );

    if (
      selectedText === findText ||
      (!caseSensitive && selectedText.toLowerCase() === findText.toLowerCase())
    ) {
      editor.chain().focus().insertContent(replaceText).run();

      setTimeout(() => {
        const matches = highlightMatches();
        if (matches.length > 0) {
          const nextIndex = Math.min(currentMatch, matches.length - 1);
          setCurrentMatch(nextIndex);
          goToMatch(matches, nextIndex);
        }
      }, 100);
    }
  }, [
    editor,
    findText,
    replaceText,
    caseSensitive,
    matchCount,
    currentMatch,
    highlightMatches,
    goToMatch,
  ]);

  const replaceAll = useCallback(() => {
    if (!editor || !findText || matchCount === 0) return;

    const { state } = editor;
    const { doc } = state;
    let offset = 0;
    let replacedCount = 0;

    const searchRegex = new RegExp(
      wholeWord
        ? `\\b${findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
        : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      caseSensitive ? 'g' : 'gi'
    );

    const tr = state.tr;

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
            editor.schema.text(replaceText)
          );
          offset += replaceText.length - m.length;
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
    setCurrentMatch(0);
    setMatchCount(0);
  }, [
    editor,
    findText,
    replaceText,
    caseSensitive,
    wholeWord,
    matchCount,
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
    <Box
      position="absolute"
      top={4}
      right={4}
      zIndex={1000}
      bg={bgColor}
      borderRadius="md"
      border="1px solid"
      borderColor={borderColor}
      boxShadow={shadowColor}
      p={3}
      minWidth="350px"
      maxWidth="400px"
    >
      <VStack spacing={3} align="stretch">
        {/* Header with close button */}
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Text fontWeight="semibold" fontSize="sm">
              Find & Replace
            </Text>
            <IconButton
              aria-label="Toggle replace"
              icon={showReplace ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="xs"
              variant="ghost"
              onClick={() => setShowReplace(!showReplace)}
            />
          </HStack>
          <IconButton
            aria-label="Close"
            icon={<CloseIcon />}
            size="xs"
            variant="ghost"
            onClick={onClose}
          />
        </HStack>

        {/* Find input and buttons */}
        <HStack spacing={2}>
          <Input
            size="sm"
            value={findText}
            onChange={e => setFindText(e.target.value)}
            placeholder="Find..."
            autoFocus
          />
          <Button
            size="sm"
            onClick={findPrevious}
            isDisabled={matchCount === 0}
          >
            ↑
          </Button>
          <Button size="sm" onClick={findNext} isDisabled={matchCount === 0}>
            ↓
          </Button>
        </HStack>

        {/* Replace section */}
        <Collapse in={showReplace} animateOpacity>
          <VStack spacing={2} align="stretch">
            <Input
              size="sm"
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              placeholder="Replace with..."
            />
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={replaceCurrent}
                isDisabled={matchCount === 0}
                flex={1}
              >
                Replace
              </Button>
              <Button
                size="sm"
                onClick={replaceAll}
                isDisabled={matchCount === 0}
                colorScheme="purple"
                flex={1}
              >
                Replace All
              </Button>
            </HStack>
          </VStack>
        </Collapse>

        {/* Options and match count */}
        <HStack justify="space-between" fontSize="xs">
          <HStack spacing={3}>
            <Checkbox
              size="sm"
              isChecked={caseSensitive}
              onChange={e => setCaseSensitive(e.target.checked)}
            >
              Case
            </Checkbox>
            <Checkbox
              size="sm"
              isChecked={wholeWord}
              onChange={e => setWholeWord(e.target.checked)}
            >
              Word
            </Checkbox>
          </HStack>
          {findText && (
            <Text color="gray.600">
              {matchCount > 0
                ? `${currentMatch + 1}/${matchCount}`
                : 'No matches'}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
