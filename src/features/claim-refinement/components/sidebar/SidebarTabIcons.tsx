import React from 'react';
import {
  FiMessageCircle,
  FiSearch,
  FiFileText,
  FiBookmark,
  // NOTE: FiImage temporarily removed with Image Analysis - may be reactivated in the future
  // FiImage,
  // NOTE: FiZap temporarily removed with Prior Art Analysis - may be reactivated in the future
  // FiZap,
} from 'react-icons/fi';

/**
 * Component to render tab icons for the claim sidebar
 */
export function SidebarTabIcons() {
  return [
    <div key="searchIcon" className="flex items-center justify-center h-6">
      <FiSearch className="w-4 h-4" />
    </div>, // Search tab
    // NOTE: Image Analysis icon temporarily removed - may be reactivated in the future
    // <div key="imageAnalysisIcon" className="flex items-center justify-center h-6">
    //   <FiImage className="w-4 h-4" />
    // </div>, // Image Analysis tab
    <div key="citationsIcon" className="flex items-center justify-center h-6">
      <FiFileText className="w-4 h-4" />
    </div>, // Citations tab
    <div
      key="savedPriorArtIcon"
      className="flex items-center justify-center h-6"
    >
      <FiBookmark className="w-4 h-4" />
    </div>, // Saved Prior Art tab
    // NOTE: Prior Art Analysis icon temporarily removed - may be reactivated in the future
    // <div
    //   key="priorArtAnalysisIcon"
    //   className="flex items-center justify-center h-6"
    // >
    //   <FiZap className="w-4 h-4" />
    // </div>, // Prior Art Analysis tab
    <div key="chatIcon" className="flex items-center justify-center h-6">
      <FiMessageCircle className="w-4 h-4" />
    </div>, // Chat tab
  ];
}
