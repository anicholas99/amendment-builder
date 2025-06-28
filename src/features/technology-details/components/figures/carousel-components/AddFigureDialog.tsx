import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Box,
  Button,
  Text,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

interface FigureOption {
  label: string;
  value: string;
  isVariant: boolean;
  baseNumber: number;
  variant: string;
}

interface AddFigureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  options: FigureOption[];
  onAddFigure: (figureNumber: string) => void;
}

/**
 * A modal dialog for adding new figures with a better UX for figure numbering
 */
const AddFigureDialog: React.FC<AddFigureDialogProps> = ({
  isOpen,
  onClose,
  options,
  onAddFigure,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [customFigureNumber, setCustomFigureNumber] = useState('');
  const toast = useToast();

  // Theme colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const variantsBg = useColorModeValue('gray.50', 'gray.800');
  const scrollbarBg = useColorModeValue(
    'rgba(0, 0, 0, 0.05)',
    'rgba(255, 255, 255, 0.05)'
  );
  const scrollbarThumbBg = useColorModeValue(
    'rgba(0, 0, 0, 0.2)',
    'rgba(255, 255, 255, 0.2)'
  );
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const blueHoverBg = useColorModeValue('blue.50', 'blue.900');
  const purpleHoverBg = useColorModeValue('purple.50', 'purple.900');

  // Group options by main figures and variants
  const mainFigures = options.filter(opt => !opt.isVariant);
  const variantGroups: Record<number, FigureOption[]> = {};

  options
    .filter(opt => opt.isVariant)
    .forEach(variant => {
      if (!variantGroups[variant.baseNumber]) {
        variantGroups[variant.baseNumber] = [];
      }
      variantGroups[variant.baseNumber].push(variant);
    });

  // Handle clicking on a suggested option
  const handleOptionClick = (option: FigureOption) => {
    onAddFigure(option.value);
    onClose();
  };

  // Handle custom figure number entry
  const handleCustomSubmit = () => {
    if (!customFigureNumber.trim()) {
      toast({
        title: 'Empty figure number',
        description: 'Please enter a figure number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Basic validation for format
    const isValidFormat = /^\d+[A-Za-z]*$/i.test(customFigureNumber.trim());
    if (!isValidFormat) {
      toast({
        title: 'Invalid format',
        description: 'Figure number must be in format "1", "1A", etc.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onAddFigure(customFigureNumber.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent
        borderRadius="lg"
        minWidth={{ base: '90%', md: '600px' }}
        maxWidth="800px"
      >
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          Add New Figure
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body}>
          <Tabs
            index={activeTab}
            onChange={setActiveTab}
            variant="soft-rounded"
            colorScheme="blue"
          >
            <TabList mb={4}>
              <Tab fontWeight="normal">Quick Select</Tab>
              <Tab fontWeight="normal">Custom Number</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Text fontWeight="semibold" mb={3} color="blue.600">
                  Next Figure
                </Text>
                <SimpleGrid columns={3} spacing={3}>
                  {mainFigures.map(option => (
                    <Button
                      key={option.value}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => handleOptionClick(option)}
                      height="60px"
                      width="100%"
                      _hover={{ bg: blueHoverBg }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </SimpleGrid>

                {Object.keys(variantGroups).length > 0 && (
                  <Box
                    width="100%"
                    bg={variantsBg}
                    p={3}
                    borderRadius="md"
                    mt={4}
                  >
                    <Text fontWeight="semibold" mb={3} color="purple.600">
                      Variant Options
                    </Text>
                    <Box
                      maxHeight="240px"
                      overflowY="auto"
                      pr={2}
                      className="custom-scrollbar"
                    >
                      {Object.entries(variantGroups).map(
                        ([baseNumber, variants]) => (
                          <Box
                            key={baseNumber}
                            mb={4}
                            pb={3}
                            borderBottom={
                              parseInt(baseNumber) <
                              Math.max(
                                ...Object.keys(variantGroups).map(Number)
                              )
                                ? '1px'
                                : '0'
                            }
                            borderColor={borderColor}
                          >
                            <Text
                              fontSize="sm"
                              mb={2}
                              fontWeight="medium"
                              color={labelColor}
                            >
                              FIG. {baseNumber} Variants
                            </Text>
                            <SimpleGrid columns={5} spacing={2}>
                              {variants.map(variant => (
                                <Button
                                  key={variant.value}
                                  size="sm"
                                  variant="outline"
                                  colorScheme="purple"
                                  onClick={() => handleOptionClick(variant)}
                                  py={1}
                                  height="auto"
                                  _hover={{ bg: purpleHoverBg }}
                                >
                                  {variant.label.replace(/FIG\.\s*/i, '')}
                                </Button>
                              ))}
                            </SimpleGrid>
                          </Box>
                        )
                      )}
                    </Box>
                  </Box>
                )}
              </TabPanel>

              <TabPanel p={0}>
                <FormControl>
                  <FormLabel fontWeight="semibold">
                    Custom Figure Number
                  </FormLabel>
                  <Stack direction="row" spacing={2}>
                    <Text
                      fontWeight="semibold"
                      fontSize="lg"
                      color={labelColor}
                    >
                      FIG.
                    </Text>
                    <Input
                      value={customFigureNumber}
                      onChange={e => setCustomFigureNumber(e.target.value)}
                      placeholder="1"
                      size="md"
                      width="120px"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleCustomSubmit();
                        }
                      }}
                    />
                    <Button
                      {...modalButtonStyles.primary}
                      onClick={handleCustomSubmit}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Text fontSize="sm" color={mutedTextColor} mt={2}>
                    Enter a figure number like "1", "2A", or "3B". The prefix
                    "FIG." will be added automatically.
                  </Text>
                </FormControl>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button onClick={onClose} {...modalButtonStyles.secondary}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddFigureDialog;
