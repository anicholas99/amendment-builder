/**
 * Figure Repository - Re-exports all figure-related functionality
 * This maintains backward compatibility after refactoring
 */

// Re-export all types
export type {
  FigureUploadData,
  FigureAccessInfo,
  FigureUpdateData,
  FigureMetadataUpdate,
  FigureElementData,
  FigureAssignment,
  FigureWithElements,
  ElementInfo,
} from '@/types/figure';

// Re-export core CRUD operations
export {
  createProjectFigure,
  getProjectFigure,
  listProjectFigures,
  deleteProjectFigure,
  updateProjectFigure,
  listUnassignedProjectFigures,
} from './core';

// Re-export assignment operations
export {
  assignFigureToSlot,
  bulkAssignFiguresToSlots,
  unassignFigure,
} from './assignment';

// Re-export element operations
export {
  getFiguresWithElements,
  updateFigureMetadata,
  getElementsForFigure,
  addElementToFigure,
  removeElementFromFigure,
  updateElementCallout,
  getProjectElements,
  updateElementName,
} from './elements';

// Import element operations for the figureRepository object
import {
  getFiguresWithElements,
  updateFigureMetadata,
  getElementsForFigure,
  addElementToFigure,
  removeElementFromFigure,
  updateElementCallout,
  getProjectElements,
  updateElementName,
} from './elements';

// Re-export the figureRepository object for backward compatibility
export const figureRepository = {
  getFiguresWithElements,
  updateFigureMetadata,
  getElementsForFigure,
  addElementToFigure,
  removeElementFromFigure,
  updateElementCallout,
  getProjectElements,
  updateElementName,
};
