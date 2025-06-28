import React, { useState, useCallback, useMemo } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { InventionData } from '@/types';
import { findClaimDependencies } from '../utils/validation';
import { extractClaimPreamble, extractClaimType } from '../utils/analysis';
import { useRouter } from 'next/router';

/**
 * Custom hook for managing claims
 */
export const useClaimManagement = (
  analyzedInvention: InventionData | null,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >,
  updateToDatabase?: (invention: InventionData | null) => void,
  saveVersion?: (description: string) => void
) => {
  const toast = useToast();
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimDependsOn, setNewClaimDependsOn] = useState('');
  const [hasClaim1, setHasClaim1] = useState(false);

  // Handle changing a claim's text
  const handleClaimChange = useCallback(
    (claimNumber: string, text: string) => {
      logger.log(
        `Updating claim ${claimNumber} with text (${text.length} chars)`
      );

      if (!analyzedInvention) {
        logger.error('Cannot update claim: No invention data available');
        return;
      }

      setAnalyzedInvention(prevInvention => {
        if (!prevInvention) return null;

        // Make sure claims object exists
        const currentClaims = prevInvention.claims || {};

        // Create updated claims object
        const updatedClaims = {
          ...currentClaims,
          [claimNumber]: text,
        };

        // Update the analyzed invention with the new claims
        const updatedInvention = {
          ...prevInvention,
          claims: updatedClaims,
        };

        // Persist to database if function provided
        if (updateToDatabase) {
          updateToDatabase(updatedInvention);
        }

        return updatedInvention;
      });

      // Toast will be shown by the mutation

      // Save a version if the saveVersion callback was provided
      if (saveVersion) {
        saveVersion(`Updated claim ${claimNumber}`);
      }
    },
    [analyzedInvention, setAnalyzedInvention, saveVersion, updateToDatabase]
  );

  // Handle deleting a claim
  const handleDeleteClaim = useCallback(
    (claimNumber: string) => {
      logger.log(`Deleting claim ${claimNumber}`);

      if (!analyzedInvention) {
        logger.error('Cannot delete claim: No invention data available');
        return;
      }

      // Check if claims exist and is not null
      const currentClaims = analyzedInvention.claims;
      if (!currentClaims) {
        toast({
          title: 'Error',
          description: 'No claims found',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Get the current claims
      if (Array.isArray(currentClaims)) {
        // It's an array of claim texts
        const claimIndex = parseInt(claimNumber) - 1;
        if (claimIndex < 0 || claimIndex >= currentClaims.length) {
          toast({
            title: 'Error',
            description: `Claim ${claimNumber} not found`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Create a new array without the deleted claim
        const updatedClaims = currentClaims.filter(
          (_, index) => index !== claimIndex
        );

        // Update the analyzed invention with renumbered claims
        const updatedInvention = {
          ...analyzedInvention,
          claims: updatedClaims as typeof analyzedInvention.claims,
        };

        setAnalyzedInvention(updatedInvention);

        // Persist to database if function provided
        if (updateToDatabase) {
          updateToDatabase(updatedInvention);
        }
      } else {
        // It's a Record<string, string>
        // Check if the claim exists in the record
        if (!(claimNumber in currentClaims)) {
          toast({
            title: 'Error',
            description: `Claim ${claimNumber} not found`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Create a copy of the claims
        const updatedClaims: Record<string, string> = {};
        let newClaimNumber = 1;

        // Rebuild claims with new numbering, skipping the deleted claim
        Object.entries(currentClaims)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .forEach(([num, text]) => {
            if (num !== claimNumber) {
              // Update dependencies in the claim text if needed
              let updatedText = text;
              if (text.toLowerCase().includes('claim')) {
                const dependencyMatch = text.match(/claim\s+(\d+)/i);
                if (dependencyMatch && dependencyMatch[1]) {
                  const oldDepNum = parseInt(dependencyMatch[1]);
                  // If the claim depended on a higher number claim that's being shifted down
                  if (oldDepNum > parseInt(claimNumber)) {
                    updatedText = text.replace(
                      /claim\s+(\d+)/i,
                      `claim ${oldDepNum - 1}`
                    );
                  }
                }
              }
              updatedClaims[newClaimNumber.toString()] = updatedText;
              newClaimNumber++;
            }
          });

        // Update the analyzed invention with renumbered claims
        const updatedInvention = {
          ...analyzedInvention,
          claims: updatedClaims as typeof analyzedInvention.claims,
        };

        setAnalyzedInvention(updatedInvention);

        // Persist to database if function provided
        if (updateToDatabase) {
          updateToDatabase(updatedInvention);
        }
      }

      // Save version if function is provided
      if (saveVersion) {
        saveVersion(`Deleted claim ${claimNumber}`);
      }
    },
    [
      analyzedInvention,
      setAnalyzedInvention,
      toast,
      saveVersion,
      updateToDatabase,
    ]
  );

  // Handle adding a new claim (stub)
  const handleAddClaim = useCallback(() => {
    logger.log('Adding new claim with text:', {
      text: newClaimText,
      dependsOn: newClaimDependsOn,
    });

    if (!analyzedInvention) {
      logger.error('Cannot add claim: No invention data available');
      return;
    }

    if (!newClaimText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter claim text',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Get the current claims - ensure it's a Record<string, string>
    const currentClaims = (analyzedInvention.claims || {}) as Record<
      string,
      string
    >;

    // Determine the new claim number
    const claimNumbers = Object.keys(currentClaims).map(num => parseInt(num));
    const newClaimNumber =
      claimNumbers.length > 0 ? Math.max(...claimNumbers) + 1 : 1;

    // Build the claim text for dependent claims
    let finalClaimText = newClaimText;
    if (newClaimDependsOn && newClaimDependsOn !== '0') {
      // Check if the text already starts with a dependency phrase
      if (
        !finalClaimText.toLowerCase().includes(`claim ${newClaimDependsOn}`)
      ) {
        // Extract the preamble from the parent claim to use the correct terminology
        const currentClaims = analyzedInvention.claims || {};
        const parentClaimText =
          (currentClaims as Record<string, string>)[newClaimDependsOn] || '';
        const preamble = extractClaimPreamble(parentClaimText);
        finalClaimText = `${preamble} of claim ${newClaimDependsOn}, wherein ${finalClaimText}`;
      }
    }

    // Update the analyzed invention with the new claim
    const updatedClaims = {
      ...currentClaims,
      [newClaimNumber]: finalClaimText,
    };

    const updatedInvention = {
      ...analyzedInvention,
      claims: updatedClaims,
    };

    setAnalyzedInvention(updatedInvention);

    // Persist to database if function provided
    if (updateToDatabase) {
      updateToDatabase(updatedInvention);
    }

    // Reset form and close it
    setNewClaimText('');
    setNewClaimDependsOn('');
    setIsAddingClaim(false);

    // Save version if function is provided
    if (saveVersion) {
      saveVersion(`Added claim ${newClaimNumber}`);
    }
  }, [
    analyzedInvention,
    setAnalyzedInvention,
    newClaimText,
    newClaimDependsOn,
    toast,
    saveVersion,
    updateToDatabase,
  ]);

  // Handle inserting a new claim (stub)
  const handleInsertNewClaim = useCallback(
    (afterClaimNumber: string, text: string = '', dependsOn: string = '') => {
      logger.log('Inserting new claim after claim', { afterClaimNumber });

      if (!analyzedInvention) {
        logger.error('Cannot insert claim: No invention data available');
        return;
      }

      // Get the current claims - ensure it's a Record<string, string>
      const currentClaims = (analyzedInvention.claims || {}) as Record<
        string,
        string
      >;

      // Create the new claim text with dependency if specified
      let newClaimText = text;
      if (dependsOn && dependsOn !== '0') {
        const parentClaimText: string = currentClaims[dependsOn] || '';
        const preamble = extractClaimPreamble(parentClaimText as any);
        newClaimText = `${preamble} of claim ${dependsOn}, wherein ${text}`;
      }

      // Create a new claims object with renumbering
      const updatedClaims: Record<string, string> = {};
      const sortedClaimNumbers = Object.keys(currentClaims)
        .map(num => parseInt(num))
        .sort((a, b) => a - b);

      let newClaimNumber = 1;
      let insertedClaim = false;

      sortedClaimNumbers.forEach(num => {
        // Add the current claim
        updatedClaims[newClaimNumber.toString()] =
          currentClaims[num.toString()];

        // If this is where we should insert the new claim
        if (num.toString() === afterClaimNumber && !insertedClaim) {
          newClaimNumber++;
          updatedClaims[newClaimNumber.toString()] = newClaimText;
          insertedClaim = true;
        }

        newClaimNumber++;
      });

      // Update the analyzed invention
      const updatedInvention = {
        ...analyzedInvention,
        claims: updatedClaims,
      };

      setAnalyzedInvention(updatedInvention);

      // Persist to database if function provided
      if (updateToDatabase) {
        updateToDatabase(updatedInvention);
      }

      // Save version if function is provided
      if (saveVersion) {
        saveVersion(`Inserted claim after claim ${afterClaimNumber}`);
      }
    },
    [analyzedInvention, setAnalyzedInvention, saveVersion, updateToDatabase]
  );

  // Handle reordering a claim
  const handleReorderClaim = useCallback(
    (claimNumber: string, direction: 'up' | 'down') => {
      try {
        if (!analyzedInvention) {
          toast({
            title: 'Error',
            description: 'No invention data',
            status: 'error',
          });
          return;
        }

        const currentClaims = (analyzedInvention.claims || {}) as Record<
          string,
          string
        >;
        const claimNumbers = Object.keys(currentClaims).sort(
          (a, b) => parseInt(a) - parseInt(b)
        );
        const currentIndex = claimNumbers.indexOf(claimNumber);

        if (currentIndex === -1) {
          toast({
            title: 'Error',
            description: 'Claim not found',
            status: 'error',
          });
          return;
        }

        const targetIndex =
          direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= claimNumbers.length) {
          toast({
            title: 'Error',
            description: `Cannot move claim ${direction}`,
            status: 'error',
          });
          return;
        }

        const targetClaimNumber = claimNumbers[targetIndex];

        // Perform the swap
        const newClaims = { ...currentClaims };
        const tempText = newClaims[claimNumber];
        newClaims[claimNumber] = newClaims[targetClaimNumber];
        newClaims[targetClaimNumber] = tempText;

        // Update state
        const updatedInvention = {
          ...analyzedInvention,
          claims: newClaims,
        };

        setAnalyzedInvention(updatedInvention);

        // Persist to database if function provided
        if (updateToDatabase) {
          updateToDatabase(updatedInvention);
        }

        if (saveVersion) {
          saveVersion(`Reordered claim ${claimNumber} ${direction}`);
        }
      } catch (error) {
        logger.error('Error reordering claim:', error);
        toast({
          title: 'Error',
          description: 'Failed to reorder claim',
          status: 'error',
        });
      }
    },
    [
      analyzedInvention,
      setAnalyzedInvention,
      toast,
      saveVersion,
      updateToDatabase,
    ]
  );

  return {
    newClaimText,
    setNewClaimText,
    newClaimDependsOn,
    setNewClaimDependsOn,
    isAddingClaim,
    setIsAddingClaim,
    hasClaim1,
    handleClaimChange,
    handleDeleteClaim,
    handleAddClaim,
    handleInsertNewClaim,
    handleReorderClaim,
  };
};

export default useClaimManagement;
