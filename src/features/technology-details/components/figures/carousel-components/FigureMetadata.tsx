import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  IconButton,
  Input,
  Icon,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEdit, FiPlus } from 'react-icons/fi';
import CustomEditable from '../../../../../components/common/CustomEditable';
import { FigureMetadataProps } from './types';

const FigureMetadata: React.FC<
  FigureMetadataProps & {
    onUpdateDescription: (newDescription: string) => void;
  }
> = React.memo(
  ({
    figure,
    figureNum,
    onAddNewFigure,
    onRenameFigure,
    onUpdateDescription,
  }) => {
    const toast = useToast();
    const [isEditingFigure, setIsEditingFigure] = useState(false);
    const [figureDraft, setFigureDraft] = useState('');

    // Theme-aware colors
    const figureNumBg = useColorModeValue('gray.50', 'gray.700');
    const figureNumHoverBg = useColorModeValue('gray.100', 'gray.600');
    const prefixColor = useColorModeValue('gray.500', 'gray.400');
    const editIconColor = useColorModeValue('gray.400', 'gray.500');

    const startEditingFigure = () => {
      if (!onRenameFigure) return;
      setFigureDraft(figureNum.replace(/FIG\.\s*/i, ''));
      setIsEditingFigure(true);
    };

    const cancelEditingFigure = () => setIsEditingFigure(false);

    const saveFigureNumber = () => {
      if (!onRenameFigure) return;
      if (!figureDraft.trim() || !/^\d+[A-Za-z]*$/i.test(figureDraft.trim())) {
        toast({
          title: 'Invalid format',
          description: 'Figure number must be in format "1", "1A", etc.',
          status: 'error',
          duration: 3000,
        });
        return;
      }
      onRenameFigure(figureDraft.trim());
      setIsEditingFigure(false);
    };

    return (
      <Box width="100%">
        <Flex align="flex-start" className="w-full gap-2">
          <Box className="w-25 relative">
            {isEditingFigure ? (
              <Flex
                align="center"
                bg={figureNumBg}
                borderRadius="md"
                p="4px 8px"
              >
                <Text fontSize="sm" mr="4px" color={prefixColor}>
                  FIG.
                </Text>
                <Input
                  value={figureDraft}
                  onChange={e => setFigureDraft(e.target.value)}
                  size="sm"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveFigureNumber();
                    if (e.key === 'Escape') cancelEditingFigure();
                  }}
                  onBlur={saveFigureNumber}
                  variant="unstyled"
                  textAlign="left"
                  pl="4px"
                  width="60px"
                />
              </Flex>
            ) : (
              <Flex
                align="center"
                onClick={onRenameFigure ? startEditingFigure : undefined}
                cursor={onRenameFigure ? 'pointer' : 'default'}
                bg={figureNumBg}
                _hover={onRenameFigure ? { bg: figureNumHoverBg } : {}}
                borderRadius="md"
                p="4px 8px"
                transition="background-color 0.15s ease-out, transform 0.15s ease-out"
              >
                <Text fontSize="sm" color="text.primary" noOfLines={1}>
                  {figureNum}
                </Text>
                {onRenameFigure && (
                  <Icon as={FiEdit} ml="auto" color={editIconColor} />
                )}
              </Flex>
            )}
          </Box>

          <IconButton
            icon={<Icon as={FiPlus} />}
            aria-label="Add new figure"
            size="sm"
            variant="ghost"
            onClick={onAddNewFigure}
            minWidth="20px"
            p="4px"
          />

          <Box className="flex-1 relative -mt-px">
            <CustomEditable
              value={figure?.description || ''}
              onChange={onUpdateDescription}
              placeholder="Describe this figure..."
              fontSize="sm"
              p="4px 8px"
              staticBorder
            />
          </Box>
        </Flex>
      </Box>
    );
  }
);

FigureMetadata.displayName = 'FigureMetadata';

export default FigureMetadata;
