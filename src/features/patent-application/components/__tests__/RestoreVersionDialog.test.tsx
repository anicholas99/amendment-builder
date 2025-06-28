import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { RestoreVersionDialog } from '../RestoreVersionDialog';

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSaveAndRestore: jest.fn(),
  onDiscardAndRestore: jest.fn(),
  versionName: 'Version 1.0 - Initial Draft',
  isSaving: false,
  isRestoring: false,
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('RestoreVersionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with correct content', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} />);

    expect(screen.getByText('Unsaved Changes Detected')).toBeInTheDocument();
    expect(
      screen.getByText(/You have unsaved changes in your current patent application/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Version 1.0 - Initial Draft/)).toBeInTheDocument();
  });

  it('displays all three options', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} />);

    expect(screen.getByText('Save current changes')).toBeInTheDocument();
    expect(screen.getByText('Discard changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel', { selector: 'span' })).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDiscardAndRestore when Discard & Restore is clicked', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} />);

    const discardButton = screen.getByRole('button', { name: 'Discard & Restore' });
    fireEvent.click(discardButton);

    expect(mockProps.onDiscardAndRestore).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveAndRestore when Save & Restore is clicked', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save & Restore' });
    fireEvent.click(saveButton);

    expect(mockProps.onSaveAndRestore).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows loading state when saving', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} isSaving={true} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const discardButton = screen.getByRole('button', { name: 'Discard & Restore' });
    const saveButton = screen.getByRole('button', { name: /Saving/ });

    expect(cancelButton).toBeDisabled();
    expect(discardButton).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it('disables buttons and shows loading state when restoring', () => {
    renderWithChakra(<RestoreVersionDialog {...mockProps} isRestoring={true} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const discardButton = screen.getByRole('button', { name: /Restoring/ });
    const saveButton = screen.getByRole('button', { name: 'Save & Restore' });

    expect(cancelButton).toBeDisabled();
    expect(discardButton).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it('prevents closing when processing', () => {
    const { rerender } = renderWithChakra(
      <RestoreVersionDialog {...mockProps} isSaving={true} />
    );

    // Try to close by clicking overlay (should not work when processing)
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockProps.onClose).not.toHaveBeenCalled();
    }

    // Should work when not processing
    rerender(
      <ChakraProvider>
        <RestoreVersionDialog {...mockProps} isSaving={false} />
      </ChakraProvider>
    );

    if (overlay) {
      fireEvent.click(overlay);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderWithChakra(
      <RestoreVersionDialog {...mockProps} isOpen={false} />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
}); 