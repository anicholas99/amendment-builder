import React from 'react';
import { Divider } from '@chakra-ui/react';
import { InventionData } from '@/types/invention';
import { logger } from '@/lib/monitoring/logger';

// Import all necessary section components
import TechInventionTitle from './TechInventionTitle';
import TechClassificationSection from './TechClassificationSection';
import TechBackgroundSection from './TechBackgroundSection';
import TechSummarySection from './TechSummarySection';
import TechNoveltySection from './TechNoveltySection';
import TechFeaturesSection from './TechFeaturesSection';
import TechAdvantagesSection from './TechAdvantagesSection';
import TechImplementationSection from './TechImplementationSection';
import TechAlternativeEmbodimentsSection from './TechAlternativeEmbodimentsSection';
import TechManufacturingMethodsSection from './TechManufacturingMethodsSection';
import TechProcessStepsSection from './TechProcessStepsSection';
import TechUseCasesSection from './TechUseCasesSection';
import TechClaimsSection from './TechClaimsSection';
import TechDefinitionsSection from './TechDefinitionsSection';

/**
 * Props for TechSectionsRenderer
 * Now super clean - just one update function to rule them all
 */
interface TechSectionsRendererProps {
  analyzedInvention: InventionData | null;
  getFontSize: (baseSize: string) => string;
  onUpdate: (fieldName: string, value: any) => void;
}

/**
 * Renders all the sections of the tech details panel
 * Each section calls onUpdate with the appropriate field name
 * The unified update hook handles all the complexity
 */
const TechSectionsRenderer: React.FC<TechSectionsRendererProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdate,
}) => {
  return (
    <>
      {/* Title and Abstract */}
      <TechInventionTitle
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateTitle={value => onUpdate('title', value)}
        onUpdateAbstract={value => onUpdate('abstract', value)}
      />

      <Divider borderColor="border.light" />

      {/* Classification - Required First */}
      <TechClassificationSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdatePatentCategory={value => onUpdate('patentCategory', value)}
        onUpdateTechnicalField={value => onUpdate('technicalField', value)}
      />

      <Divider borderColor="border.light" />

      {/* Background */}
      <TechBackgroundSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateBackgroundTechnicalField={value => {
          // Update the background object with the technical field
          const currentBackground = analyzedInvention?.background || {};
          const backgroundObj =
            typeof currentBackground === 'object'
              ? currentBackground
              : { technicalField: currentBackground };

          onUpdate('background', {
            ...backgroundObj,
            technicalField: value,
          });
        }}
        onUpdateProblemsSolved={items => {
          const currentBackground = analyzedInvention?.background || {};
          const backgroundObj =
            typeof currentBackground === 'object' ? currentBackground : {};
          onUpdate('background', {
            ...backgroundObj,
            problemsSolved: items,
          });
        }}
        onUpdateExistingSolutions={items => {
          const currentBackground = analyzedInvention?.background || {};
          const backgroundObj =
            typeof currentBackground === 'object' ? currentBackground : {};
          onUpdate('background', {
            ...backgroundObj,
            existingSolutions: items,
          });
        }}
      />

      <Divider borderColor="border.light" />

      {/* Summary */}
      <TechSummarySection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateSummary={value => onUpdate('summary', value)}
      />

      <Divider borderColor="border.light" />

      {/* Novelty */}
      <TechNoveltySection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateNovelty={value => onUpdate('novelty', value)} // Maps to noveltyStatement
      />

      <Divider borderColor="border.light" />

      {/* Key Features */}
      <TechFeaturesSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateFeatures={items => onUpdate('features', items)} // Maps to featuresJson
      />

      <Divider borderColor="border.light" />

      {/* Advantages */}
      <TechAdvantagesSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateAdvantages={items => onUpdate('advantages', items)} // Maps to advantagesJson
      />

      <Divider borderColor="border.light" />

      {/* Technical Implementation */}
      <TechImplementationSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateImplementation={value =>
          onUpdate('technicalImplementation', value)
        }
      />

      <Divider borderColor="border.light" />

      {/* Alternative Embodiments */}
      <TechAlternativeEmbodimentsSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateAlternativeEmbodiments={items => {
          // Update the technicalImplementation object with new alternative embodiments
          const currentImpl = analyzedInvention?.technicalImplementation || {};
          onUpdate('technicalImplementation', {
            ...currentImpl,
            alternative_embodiments: items,
          });
        }}
      />

      <Divider borderColor="border.light" />

      {/* Manufacturing Methods */}
      <TechManufacturingMethodsSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateManufacturingMethods={items => {
          // Update the technicalImplementation object with new manufacturing methods
          const currentImpl = analyzedInvention?.technicalImplementation || {};
          onUpdate('technicalImplementation', {
            ...currentImpl,
            manufacturing_methods: items,
          });
        }}
      />

      <Divider borderColor="border.light" />

      {/* Process Steps */}
      <TechProcessStepsSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateProcessSteps={items => onUpdate('processSteps', items)} // Maps to processStepsJson
      />

      <Divider borderColor="border.light" />

      {/* Use Cases */}
      <TechUseCasesSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateUseCases={items => onUpdate('useCases', items)} // Maps to useCasesJson
      />

      <Divider borderColor="border.light" />

      {/* Claims - Read only */}
      <TechClaimsSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
      />

      <Divider borderColor="border.light" />

      {/* Technical Definitions - Currently not editable */}
      <TechDefinitionsSection
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateDefinitions={() => {
          // TODO: Implement when definitions become editable
          logger.debug(
            '[TechSectionsRenderer] Definitions update not implemented yet'
          );
        }}
      />
    </>
  );
};

export default TechSectionsRenderer;
