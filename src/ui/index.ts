/**
 * UI Components - Direct @chakra-ui/react Usage Only
 *
 * ⚠️  IMPORTANT: For 100% consistency, use direct imports from @chakra-ui/react
 *
 * **Standard Pattern**: Always import directly from @chakra-ui/react
 *
 * ```tsx
 * import { Box, Text, Button, VStack } from '@chakra-ui/react';
 * import { FiSave } from 'react-icons/fi';
 *
 * const MyComponent = () => (
 *   <Box bg="white" p={4} borderRadius="md">
 *     <VStack spacing={4}>
 *       <Text fontSize="lg" fontWeight="bold">Clean Architecture</Text>
 *       <Button leftIcon={<FiSave />} colorScheme="blue">
 *         Save Changes
 *       </Button>
 *     </VStack>
 *   </Box>
 * );
 * ```
 */

// Templates - Complex layout components (still custom)
export { DashboardLayout } from './templates/DashboardLayout';
export type { DashboardLayoutProps } from './templates/DashboardLayout';

/**
 * ✅ MIGRATION COMPLETE - UI ABSTRACTION LAYER ELIMINATED
 *
 * All custom @/ui/atoms and @/ui/molecules have been successfully eliminated.
 * The codebase now uses direct @chakra-ui/react imports for maximum:
 *
 * - Simplicity and predictability
 * - Developer productivity and onboarding
 * - IDE support and documentation
 * - Community alignment and best practices
 *
 * 🎯 For new components: Import directly from @chakra-ui/react
 * 🚀 Zero learning curve for new developers
 * 📚 Full access to official Chakra UI documentation
 *
 * Legacy Note: Re-exports have been removed to enforce 100% consistency.
 * If you see import errors, update to direct @chakra-ui/react imports.
 */
