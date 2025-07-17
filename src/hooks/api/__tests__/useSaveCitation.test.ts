/**
 * Tests for the useSaveCitation hook
 * Verifies non-blocking behavior and optimistic updates
 */

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSaveCitation } from '../useSaveCitation';
import { CitationSaveService } from '@/services/api/citations.service';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';

// Mock the service
jest.mock('@/services/api/citations.service');

// Mock the toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
  toast: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  return Wrapper;
};

describe('useSaveCitation', () => {
  const mockCitation: ProcessedCitationMatch = {
    id: 'test-123',
    referenceNumber: 'US123456',
    referenceTitle: 'Test Patent',
    referencePublicationDate: '2023-01-01',
    parsedElementText: 'Test element',
    citation: 'Test citation text',
    reasoning: { summary: 'Test reasoning' },
  } as ProcessedCitationMatch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save citation without blocking', async () => {
    // Mock the service to track calls
    const saveSpy = jest
      .spyOn(CitationSaveService, 'saveCitation')
      .mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useSaveCitation({
          projectId: 'test-project',
          savedPriorArt: [],
        }),
      { wrapper: createWrapper() }
    );

    // Save should return immediately
    const startTime = Date.now();

    act(() => {
      result.current.saveCitation(mockCitation);
    });

    const endTime = Date.now();

    // Should complete within 10ms (non-blocking)
    expect(endTime - startTime).toBeLessThan(10);

    // Service should have been called
    expect(saveSpy).toHaveBeenCalledWith('test-project', mockCitation);
  });

  it('should not save duplicate citations', async () => {
    const saveSpy = jest.spyOn(CitationSaveService, 'saveCitation');

    const savedPriorArt: ProcessedSavedPriorArt[] = [
      {
        id: 'saved-art-1',
        projectId: 'test-project',
        patentNumber: 'US123456',
        savedAt: new Date().toISOString(),
        priorArtData: {
          number: 'US123456',
          patentNumber: 'US123456',
          title: 'Test Patent',
          source: 'PatBase',
          relevance: 1,
        },
        savedCitations: [
          {
            elementText: 'Test element',
            citation: 'Test citation text',
          },
        ],
      },
    ];

    const { result } = renderHook(
      () =>
        useSaveCitation({
          projectId: 'test-project',
          savedPriorArt,
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.saveCitation(mockCitation);
    });

    // Should not call the service for duplicates
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should correctly identify saved citations', () => {
    const savedPriorArt: ProcessedSavedPriorArt[] = [
      {
        id: 'saved-art-1',
        projectId: 'test-project',
        patentNumber: 'US123456',
        savedAt: new Date().toISOString(),
        priorArtData: {
          number: 'US123456',
          patentNumber: 'US123456',
          title: 'Test Patent',
          source: 'PatBase',
          relevance: 1,
        },
        savedCitations: [
          {
            elementText: 'Test element',
            citation: 'Test citation text',
          },
        ],
      },
    ];

    const { result } = renderHook(
      () =>
        useSaveCitation({
          projectId: 'test-project',
          savedPriorArt,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isCitationSaved(mockCitation)).toBe(true);

    const unsavedCitation = {
      ...mockCitation,
      citation: 'Different citation text',
    };

    expect(result.current.isCitationSaved(unsavedCitation)).toBe(false);
  });
});
