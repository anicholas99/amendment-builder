/**
 * Utility function to create consistent update handlers for technology components
 */
export const createUpdateHandlers = (
  handleUpdateInventionData: (key: string, value: unknown) => void,
  handleUpdateBackgroundField: (field: string, value: unknown) => void,
  handleUpdateTechnicalImplementationField: (
    field: string,
    value: unknown
  ) => void,
  toast?: (options: {
    title: string;
    description?: string;
    status: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    isClosable?: boolean;
    position?:
      | 'top'
      | 'top-left'
      | 'top-right'
      | 'bottom'
      | 'bottom-left'
      | 'bottom-right';
  }) => void
) => {
  return {
    onUpdateTitle: (value: string) => {
      handleUpdateInventionData('title', value);
    },
    onUpdateAbstract: (value: string) => {
      handleUpdateInventionData('abstract', value);
    },
    onUpdateSummary: (value: string) => {
      handleUpdateInventionData('summary', value);
    },
    onUpdatePatentCategory: (value: string) => {
      handleUpdateInventionData('patentCategory', value);
    },
    onUpdateTechnicalField: (value: string) => {
      handleUpdateInventionData('technicalField', value);
    },
    onUpdateBackgroundTechnicalField: (value: string) => {
      handleUpdateBackgroundField('technicalField', value);
    },
    onUpdateProblemsSolved: (items: string[]) => {
      handleUpdateBackgroundField('problemsSolved', items);
    },
    onUpdateExistingSolutions: (items: string[]) => {
      handleUpdateBackgroundField('existingSolutions', items);
    },
    onUpdateNovelty: (value: string) => {
      handleUpdateInventionData('novelty', value);
    },
    onUpdateFeatures: (items: string[]) => {
      handleUpdateInventionData('features', items);
    },
    onUpdatePreferredEmbodiment: (value: string) => {
      handleUpdateTechnicalImplementationField('preferredEmbodiment', value);
    },
    onUpdateAlternativeEmbodiments: (items: string[]) => {
      handleUpdateTechnicalImplementationField('alternativeEmbodiments', items);
    },
    onUpdateManufacturingMethods: (items: string[]) => {
      handleUpdateTechnicalImplementationField('manufacturingMethods', items);
    },
    onUpdateUseCases: (items: string[]) => {
      handleUpdateInventionData('useCases', items);
    },
    onUpdateProcessSteps: (items: string[]) => {
      handleUpdateInventionData('processSteps', items);
    },
    onUpdateAdvantages: (items: string[]) => {
      handleUpdateInventionData('advantages', items);
    },
  };
};
