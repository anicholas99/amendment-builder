/**
 * Unit tests for ClaimHeader component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ClaimHeader from '../ClaimHeader';

// Mock the useColorModeValue hook
jest.mock('@/hooks/useColorModeValue', () => ({
  useColorModeValue: jest.fn((light, dark) => light),
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('ClaimHeader', () => {
  const defaultProps = {
    claimViewMode: 'box' as const,
    onClaimViewModeChange: jest.fn(),
    isParsingClaim: false,
    onParseClaim: jest.fn(),
    claim1Text: 'A system comprising a processor and memory',
    onClaim1Change: jest.fn(),
    onRegenerateClaim1: jest.fn(),
    showClaimGeneration: true,
    isGeneratingClaim1: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders claim input and controls', () => {
    renderWithChakra(<ClaimHeader {...defaultProps} />);
    
    expect(screen.getByDisplayValue(defaultProps.claim1Text)).toBeInTheDocument();
    expect(screen.getByLabelText(/parse claim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/regenerate claim/i)).toBeInTheDocument();
  });

  it('calls onClaim1Change when text is edited', () => {
    renderWithChakra(<ClaimHeader {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue(defaultProps.claim1Text);
    fireEvent.change(textarea, { target: { value: 'Updated claim text' } });
    
    expect(defaultProps.onClaim1Change).toHaveBeenCalledWith('Updated claim text');
  });

  it('calls onParseClaim when parse button is clicked', () => {
    renderWithChakra(<ClaimHeader {...defaultProps} />);
    
    const parseButton = screen.getByLabelText(/parse claim/i);
    fireEvent.click(parseButton);
    
    expect(defaultProps.onParseClaim).toHaveBeenCalled();
  });

  it('calls onRegenerateClaim1 when regenerate button is clicked', () => {
    renderWithChakra(<ClaimHeader {...defaultProps} />);
    
    const regenerateButton = screen.getByLabelText(/regenerate claim/i);
    fireEvent.click(regenerateButton);
    
    expect(defaultProps.onRegenerateClaim1).toHaveBeenCalled();
  });

  it('disables parse button when parsing is in progress', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} isParsingClaim={true} />
    );
    
    const parseButton = screen.getByLabelText(/parse claim/i);
    expect(parseButton).toBeDisabled();
  });

  it('disables regenerate button when generation is in progress', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} isGeneratingClaim1={true} />
    );
    
    const regenerateButton = screen.getByLabelText(/regenerate claim/i);
    expect(regenerateButton).toBeDisabled();
  });

  it('shows loading spinner when parsing', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} isParsingClaim={true} />
    );
    
    expect(screen.getByText(/parsing/i)).toBeInTheDocument();
  });

  it('shows loading spinner when generating', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} isGeneratingClaim1={true} />
    );
    
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it('handles view mode toggle', () => {
    renderWithChakra(<ClaimHeader {...defaultProps} />);
    
    // Find and click the view mode toggle button
    const toggleButton = screen.getByLabelText(/toggle view mode/i);
    fireEvent.click(toggleButton);
    
    expect(defaultProps.onClaimViewModeChange).toHaveBeenCalledWith('list');
  });

  it('reflects current view mode in toggle button', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} claimViewMode="list" />
    );
    
    const toggleButton = screen.getByLabelText(/toggle view mode/i);
    fireEvent.click(toggleButton);
    
    expect(defaultProps.onClaimViewModeChange).toHaveBeenCalledWith('box');
  });

  it('hides claim generation controls when showClaimGeneration is false', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} showClaimGeneration={false} />
    );
    
    expect(screen.queryByLabelText(/regenerate claim/i)).not.toBeInTheDocument();
  });

  it('handles empty claim text', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} claim1Text="" />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');
  });

  it('displays placeholder text when claim is empty', () => {
    renderWithChakra(
      <ClaimHeader {...defaultProps} claim1Text="" />
    );
    
    expect(screen.getByPlaceholderText(/enter your main claim/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithChakra(<ClaimHeader {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('claim'));
    
    const parseButton = screen.getByLabelText(/parse claim/i);
    expect(parseButton).toHaveAttribute('role', 'button');
    
    const regenerateButton = screen.getByLabelText(/regenerate claim/i);
    expect(regenerateButton).toHaveAttribute('role', 'button');
  });
});