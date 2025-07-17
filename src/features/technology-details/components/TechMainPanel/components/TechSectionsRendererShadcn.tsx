import React from 'react';
import { Separator } from '@/components/ui/separator';
import { InventionData } from '@/types/invention';
import { logger } from '@/utils/clientLogger';

// Import all necessary section components - migrated versions
import TechInventionTitleShadcn from './TechInventionTitleShadcn';
import TechClassificationSectionShadcn from './TechClassificationSectionShadcn';
import TechBackgroundSectionShadcn from './TechBackgroundSectionShadcn';
import TechSummarySectionShadcn from './TechSummarySectionShadcn';
import TechNoveltySectionShadcn from './TechNoveltySectionShadcn';
import TechFeaturesSectionShadcn from './TechFeaturesSectionShadcn';
import TechAdvantagesSectionShadcn from './TechAdvantagesSectionShadcn';
import TechImplementationSectionShadcn from './TechImplementationSectionShadcn';
import TechAlternativeEmbodimentsSectionShadcn from './TechAlternativeEmbodimentsSectionShadcn';
import TechManufacturingMethodsSectionShadcn from './TechManufacturingMethodsSectionShadcn';
import TechProcessStepsSectionShadcn from './TechProcessStepsSectionShadcn';
import TechUseCasesSectionShadcn from './TechUseCasesSectionShadcn';
import TechClaimsSectionShadcn from './TechClaimsSectionShadcn';
import TechDefinitionsSectionShadcn from './TechDefinitionsSectionShadcn';
import TechFutureDirectionsSectionShadcn from './TechFutureDirectionsSectionShadcn';

/**
 * Props for TechSectionsRenderer - shadcn/ui version
 * Now super clean - just one update function to rule them all
 */
interface TechSectionsRendererShadcnProps {
  analyzedInvention: InventionData | null;
  getFontSize: (baseSize: string) => string;
  onUpdate: (fieldName: string, value: any) => void;
  zoomLevel?: number; // Add zoomLevel prop for CSS transform scaling
}

/**
 * Renders all the sections of the tech details panel - shadcn/ui version
 * Each section calls onUpdate with the appropriate field name
 * The unified update hook handles all the complexity
 */
const TechSectionsRendererShadcn: React.FC<TechSectionsRendererShadcnProps> = React.memo(({
  analyzedInvention,
  getFontSize,
  onUpdate,
  zoomLevel = 100,
}) => {
  return (
    <div
      className="overflow-x-hidden"
      style={
        {
          '--zoom-scale': zoomLevel / 100,
          transform: `scale(var(--zoom-scale))`,
          transformOrigin: 'top left',
          width: `${100 / (zoomLevel / 100)}%`,
          transition: 'transform 0.2s ease',
          willChange: zoomLevel !== 100 ? 'transform' : 'auto',
        } as React.CSSProperties
      }
    >
      {/* Title and Abstract - Using shadcn/ui version */}
      <TechInventionTitleShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateTitle={value => onUpdate('title', value)}
        onUpdateAbstract={value => onUpdate('abstract', value)}
      />

      <Separator className="bg-border-light my-2" />

      {/* Classification - Required First */}
      <TechClassificationSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdatePatentCategory={(value: string) =>
          onUpdate('patentCategory', value)
        }
        onUpdateTechnicalField={(value: string) =>
          onUpdate('technicalField', value)
        }
      />

      <Separator className="bg-border-light my-2" />

      {/* Background */}
      <TechBackgroundSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateBackgroundTechnicalField={(value: string) => {
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
        onUpdateProblemsSolved={(items: string[]) => {
          const currentBackground = analyzedInvention?.background || {};
          const backgroundObj =
            typeof currentBackground === 'object' ? currentBackground : {};
          onUpdate('background', {
            ...backgroundObj,
            problemsSolved: items,
          });
        }}
        onUpdateExistingSolutions={(items: string[]) => {
          const currentBackground = analyzedInvention?.background || {};
          const backgroundObj =
            typeof currentBackground === 'object' ? currentBackground : {};
          onUpdate('background', {
            ...backgroundObj,
            existingSolutions: items,
          });
        }}
      />

      <Separator className="bg-border-light my-2" />

      {/* Summary - Using shadcn/ui version */}
      <TechSummarySectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateSummary={value => onUpdate('summary', value)}
      />

      <Separator className="bg-border-light my-2" />

      {/* Novelty - Always show - Using shadcn/ui version */}
      <TechNoveltySectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateNovelty={value => onUpdate('novelty', value)} // Maps to noveltyStatement
      />

      <Separator className="bg-border-light my-2" />

      {/* Key Features - Using shadcn/ui version */}
      <TechFeaturesSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateFeatures={(items: string[]) => onUpdate('features', items)} // Maps to featuresJson
      />

      <Separator className="bg-border-light my-2" />

      {/* Advantages - Using shadcn/ui version */}
      <TechAdvantagesSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateAdvantages={(items: string[]) => onUpdate('advantages', items)} // Maps to advantagesJson
      />

      <Separator className="bg-border-light my-2" />

      {/* Technical Implementation - Using shadcn/ui version */}
      <TechImplementationSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateImplementation={value =>
          onUpdate('technicalImplementation', value)
        }
      />

      <Separator className="bg-border-light my-2" />

      {/* Alternative Embodiments */}
      <TechAlternativeEmbodimentsSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateAlternativeEmbodiments={(items: string[]) => {
          // Update the technicalImplementation object with new alternative embodiments
          const currentImpl = analyzedInvention?.technicalImplementation || {};
          onUpdate('technicalImplementation', {
            ...currentImpl,
            alternative_embodiments: items,
          });
        }}
      />

      <Separator className="bg-border-light my-2" />

      {/* Manufacturing Methods */}
      <TechManufacturingMethodsSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateManufacturingMethods={(items: string[]) => {
          // Update the technicalImplementation object with new manufacturing methods
          const currentImpl = analyzedInvention?.technicalImplementation || {};
          onUpdate('technicalImplementation', {
            ...currentImpl,
            manufacturing_methods: items,
          });
        }}
      />

      <Separator className="bg-border-light my-2" />

      {/* Process Steps - Using shadcn/ui version */}
      <TechProcessStepsSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateProcessSteps={(items: string[]) =>
          onUpdate('processSteps', items)
        } // Maps to processStepsJson
      />

      <Separator className="bg-border-light my-2" />

      {/* Use Cases */}
      <TechUseCasesSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateUseCases={(items: string[]) => onUpdate('useCases', items)} // Maps to useCasesJson
      />

      <Separator className="bg-border-light my-2" />

      {/* Technical Definitions - Logical to have definitions before future directions */}
      <TechDefinitionsSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateDefinitions={(definitions: Record<string, string>) =>
          onUpdate('definitions', definitions)
        }
      />

      <Separator className="bg-border-light my-2" />

      {/* Future Directions - Future enhancements and research directions */}
      <TechFutureDirectionsSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
        onUpdateFutureDirections={(items: string[]) =>
          onUpdate('futureDirections', items)
        }
      />

      <Separator className="bg-border-light my-2" />

      {/* Claims - Always at the bottom (legal structure) */}
      <TechClaimsSectionShadcn
        analyzedInvention={analyzedInvention}
        getFontSize={getFontSize}
      />
    </div>
  );
});

TechSectionsRendererShadcn.displayName = 'TechSectionsRendererShadcn';

export default TechSectionsRendererShadcn;
