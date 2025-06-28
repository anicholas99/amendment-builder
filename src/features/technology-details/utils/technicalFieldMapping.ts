/**
 * Utility functions for mapping between AI-returned technical field values
 * and user-friendly display values
 */

/**
 * Maps AI-returned technical field values (with underscores) to user-friendly dropdown values (with spaces)
 */
export const mapAiFieldToDisplayValue = (aiField: string): string => {
  const mapping: Record<string, string> = {
    Software_Computer: 'Software Computer',
    Mechanical_Electrical: 'Hardware Electronics',
    Chemical_Biological: 'Biotechnology',
    Medical_Device: 'Medical Devices',
    Renewable_Energy: 'Energy Technology',
    Agricultural: 'Biotechnology', // Closest match
    Default: 'Hardware Electronics', // Default fallback
  };

  return mapping[aiField] || aiField.replace(/_/g, ' ');
};

/**
 * Maps user-friendly display values back to AI format (for API consistency)
 */
export const mapDisplayValueToAiField = (displayValue: string): string => {
  const reverseMapping: Record<string, string> = {
    'Software Computer': 'Software_Computer',
    'Hardware Electronics': 'Mechanical_Electrical',
    Biotechnology: 'Chemical_Biological',
    'Medical Devices': 'Medical_Device',
    'Energy Technology': 'Renewable_Energy',
    'Mechanical Engineering': 'Mechanical_Electrical',
    'Chemical Engineering': 'Chemical_Biological',
    Telecommunications: 'Software_Computer', // Best fit
    'Materials Science': 'Chemical_Biological', // Best fit
    Transportation: 'Mechanical_Electrical', // Best fit
  };

  return reverseMapping[displayValue] || displayValue.replace(/ /g, '_');
};

/**
 * Gets all available dropdown options for technical field selection
 */
export const getTechnicalFieldOptions = (): string[] => {
  return [
    'Software Computer',
    'Hardware Electronics',
    'Mechanical Engineering',
    'Biotechnology',
    'Chemical Engineering',
    'Medical Devices',
    'Telecommunications',
    'Materials Science',
    'Energy Technology',
    'Transportation',
  ];
};
