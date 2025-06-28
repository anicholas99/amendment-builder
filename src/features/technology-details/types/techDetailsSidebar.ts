import React from 'react';
import { InventionData } from '../../../types';
import { FigureData } from '@/types/ui-types';
import { SavedPriorArt } from '../../search/types';
import { Figures } from '../components/figures/carousel-components/types';

/**
 * Extended InventionData - same as base InventionData for now
 */
export interface ExtendedInventionData extends InventionData {}

/**
 * Props for the main TechDetailsSidebar component
 */
export interface TechDetailsSidebarProps {
  analyzedInvention: ExtendedInventionData | null;
  onUpdateInvention: (updatedInvention: ExtendedInventionData) => void;
  onUpdateTitle: (value: string) => void;
  onUpdateAbstract: (value: string) => void;
  onUpdateSummary: (value: string) => void;
  onUpdatePatentCategory: (value: string) => void;
  onUpdateTechnicalField: (value: string) => void;
  onUpdateBackgroundTechnicalField: (value: string) => void;
  onUpdateProblemsSolved: (items: string[]) => void;
  onUpdateExistingSolutions: (items: string[]) => void;
  onUpdatePriorArt: (items: unknown[]) => void;
  onUpdateNovelty: (value: string) => void;
  onUpdateFeatures: (items: string[]) => void;
  onUpdatePreferredEmbodiment: (value: string) => void;
  onUpdateAlternativeEmbodiments: (items: string[]) => void;
  onUpdateManufacturingMethods: (items: string[]) => void;
  onUpdateUseCases: (items: string[]) => void;
  onUpdateProcessSteps: (items: string[]) => void;
  onUpdateAdvantages: (items: string[]) => void;
}

/**
 * Props for FigureManager component
 */
export interface FigureManagerProps {
  analyzedInvention: ExtendedInventionData | null;
  onUpdateInvention: (updatedInvention: ExtendedInventionData) => void;
  currentFigure: string;
  setCurrentFigure: (figure: string) => void;
  children: (figureHandlers: FigureHandlers) => React.ReactNode;
}

/**
 * Figure handlers interface containing all figure-related operations
 */
export interface FigureHandlers {
  handleElementUpdate: (
    updatedElements: Record<string, string>
  ) => Promise<void>;
  handleGenerateDetailsClick: () => Promise<void>;
  convertToFiguresType: (figures: unknown) => Figures;
  isFigureOperationsLoading: boolean;
}

/**
 * Props for PriorArtTabManager component
 */
export interface PriorArtTabManagerProps {
  activeProject: string | null;
  children: (priorArtHandlers: PriorArtTabHandlers) => React.ReactNode;
}

/**
 * Prior art tab handlers interface
 */
export interface PriorArtTabHandlers {
  currentSavedPriorArt: SavedPriorArt[];
  handleRemovePriorArt: (index: number) => void;
  handleOpenPriorArtDetails: (reference: unknown) => void;
  refreshSavedArtData: () => Promise<void>;
}

/**
 * Props for ChatManager component
 */
export interface ChatManagerProps {
  projectId: string;
  analyzedInvention: ExtendedInventionData | null;
  onUpdateInvention: (updatedInvention: ExtendedInventionData) => void;
  children: (chatHandlers: ChatHandlers) => React.ReactNode;
}

/**
 * Chat handlers interface
 */
export interface ChatHandlers {
  stableProjectData: any;
  handleChatContentUpdate: (action: string) => Promise<void>;
  chatProps: any;
}

/**
 * Props for TabManager component
 */
export interface TabManagerProps {
  figuresTabContent: React.ReactNode;
  chatTabContent: React.ReactNode;
  priorArtTabContent: React.ReactNode;
  children: (tabState: TabManagerState) => React.ReactNode;
}

/**
 * Tab manager state interface
 */
export interface TabManagerState {
  activeTab: number;
  setActiveTab: (index: number) => void;
  tabTitles: string[];
  tabIcons: React.ReactNode[];
  tabContents: React.ReactNode[];
}

/**
 * Figure conversion utility return type
 */
export interface ConvertedFigures extends Record<string, FigureData> {}

/**
 * Tab content configuration
 */
export interface TabContentConfig {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Figure initialization state
 */
export interface FigureInitializationState {
  targetFigureKey: string;
  figuresExistNow: boolean;
  isOnlyFigureNewlyAdded: boolean;
  shouldUpdateCurrentFigure: boolean;
}

/**
 * Stable project data interface for chat
 */
export interface StableProjectData {
  id: string;
  name?: string;
  title: string;
  [key: string]: any;
}
