/**
 * Icon mapping from current icon libraries (lucide-react, react-icons/fi) to Pika icons
 * This file provides a centralized mapping for icon replacement
 * 
 * Note: We're using the duo-stroke variants as they provide a more complete icon set
 */

export const ICON_MAPPINGS = {
  // UI Controls
  'X': 'PiXDuoStroke',
  'ChevronDown': 'PiDoubleChevronDownDuoStroke',
  'ChevronUp': 'PiDoubleChevronUpDuoStroke',
  'ChevronLeft': 'PiDoubleChevronLeftDuoStroke',
  'ChevronRight': 'PiDoubleChevronRightDuoStroke',
  'Check': 'PiCheckTickSingleDuoStroke',
  'Circle': 'PiCircleDotDuoStroke',
  'FiChevronDown': 'PiDoubleChevronDownDuoStroke',
  'FiChevronUp': 'PiDoubleChevronUpDuoStroke',
  'FiChevronLeft': 'PiDoubleChevronLeftDuoStroke',
  'FiChevronRight': 'PiDoubleChevronRightDuoStroke',
  
  // Files & Documents
  'FileText': 'PiFile02TextDuoStroke',
  'Download': 'PiDownloadDownDuoStroke',
  'Upload': 'PiUploadUpDuoStroke',
  'Paperclip': 'PiPaperclipDuoStroke',
  'FiFileText': 'PiFile02TextDuoStroke',
  'FiFile': 'PiFile02DefaultDuoStroke',
  'FiFolder': 'PiFolderDefaultDuoStroke',
  'FiUpload': 'PiUploadUpDuoStroke',
  'FiImage': 'PiPhotoImageDuoStroke',
  
  // Status & Alerts - These we use from solid as they're available
  'AlertTriangle': 'PiAlertTriangleSolid',
  'AlertCircle': 'PiAlertCircleSolid',
  'CheckCircle': 'PiCheckTickCircleDuoStroke',
  'XCircle': 'PiXCircleDuoStroke',
  'AlertOctagon': 'PiAlertTriangleSolid', // Using triangle as octagon not available
  'FiCheckCircle': 'PiCheckTickCircleDuoStroke',
  'FiAlertCircle': 'PiAlertCircleSolid',
  'FiInfo': 'PiInformationCircleSolid',
  
  // Actions
  'Edit': 'PiPencilEditDuoStroke',
  'Edit2': 'PiPencilEditDuoStroke',
  'Edit3': 'PiPencilEditDuoStroke',
  'Trash2': 'PiDeleteDustbin01DuoStroke',
  'Plus': 'PiPlusDuoStroke',
  'Search': 'PiSearchDefaultDuoStroke',
  'Send': 'PiSendPlaneHorizontalDuoStroke',
  'Copy': 'PiCopyDefaultDuoStroke',
  'Eye': 'PiEyeDuoStroke',
  'EyeOff': 'PiEyeOffDuoStroke',
  'FiEdit': 'PiPencilEditDuoStroke',
  'FiEdit2': 'PiPencilEditDuoStroke',
  'FiEdit3': 'PiPencilEditDuoStroke',
  'FiTrash2': 'PiDeleteDustbin01DuoStroke',
  'FiPlus': 'PiPlusDuoStroke',
  'FiSearch': 'PiSearchDefaultDuoStroke',
  'FiSave': 'PiFloppyDefaultDuoStroke',
  'FiCopy': 'PiCopyDefaultDuoStroke',
  
  // Loading
  'Loader2': 'PiSpinnerDuoStroke',
  'Loader': 'PiSpinnerDuoStroke',
  
  // Theme
  'Moon': 'PiMoonDuoStroke',
  'Sun': 'PiSunDefaultDuoStroke',
  'FiSun': 'PiSunDefaultDuoStroke',
  'FiMoon': 'PiMoonDuoStroke',
  
  // Navigation
  'ArrowRight': 'PiArrowRightDuoStroke',
  'ArrowLeft': 'PiArrowLeftDuoStroke',
  'ArrowUp': 'PiArrowUpDuoStroke',
  'ArrowDown': 'PiArrowDownDuoStroke',
  
  // AI & Tech - Using from solid/ai
  'Bot': 'PiAI01Solid',
  'Brain': 'PiBrainDuoStroke',
  'Sparkles': 'PiSparkleDuoStroke',
  'Cpu': 'PiMicrochipDuoStroke',
  
  // User & Settings
  'Settings': 'PiSettings01DuoStroke',
  'User': 'PiUserDuoStroke',
  'FiUser': 'PiUserDuoStroke',
  'FiLogOut': 'PiLogOutRightDuoStroke',
  'FiSettings': 'PiSettings01DuoStroke',
  
  // Other
  'Calendar': 'PiCalendarBlankDuoStroke',
  'Clock': 'PiTimeDuoStroke',
  'Target': 'PiFocusTargetDuoStroke',
  'Lock': 'PiLockDefaultDuoStroke',
  'Maximize2': 'PiMaximizeFourArrowDuoStroke',
  'Minimize2': 'PiMinimizeFourArrowDuoStroke',
  'FiMenu': 'PiListDefaultDuoStroke',
  'FiZap': 'PiZapBoltDuoStroke',
  'FiGrid': 'PiGrid01DuoStroke',
  'FiMaximize': 'PiMaximizeFourArrowDuoStroke',
  
  // Additional mappings
  'Info': 'PiInformationCircleSolid',
  'ExternalLink': 'PiExternalLinkSquareDuoStroke',
  'Home': 'PiHomeDefaultDuoStroke',
  'Save': 'PiFloppyDefaultDuoStroke',
  'Filter': 'PiFilterFunnelDuoStroke',
  'RefreshCw': 'PiRefreshDuoStroke',
  'Star': 'PiStarDuoStroke',
  'Heart': 'PiHeartDuoStroke',
  'Link': 'PiLinkHorizontalDuoStroke',
  'Shield': 'PiShieldCheckDuoStroke',
  'Database': 'PiDatabaseDuoStroke',
  'Server': 'PiServerDuoStroke',
  'Terminal': 'PiTerminalConsoleSquareDuoStroke',
  'Code': 'PiCodeDuoStroke',
  'GitBranch': 'PiGitBranchDuoStroke',
  'Package': 'PiPackage01DuoStroke',
  'Folder': 'PiFolderDefaultDuoStroke',
  'FolderOpen': 'PiFolderOpenDuoStroke',
  'Mail': 'PiEnvelopeDefaultDuoStroke',
  'Phone': 'PiPhoneDefaultDuoStroke',
  'MapPin': 'PiLocationPinDefaultDuoStroke',
  'Navigation': 'PiNavigationDuoStroke',
  'Bookmark': 'PiBookmarkDefaultDuoStroke',
  'Tag': 'PiTagDuoStroke',
  'Hash': 'PiHashtagDuoStroke',
  'Bell': 'PiNotificationBellOnDuoStroke',
  'BellOff': 'PiNotificationBellOffDuoStroke',
  'Volume': 'PiSpeakerOnDuoStroke',
  'VolumeX': 'PiSpeakerOffDuoStroke',
  'Mic': 'PiMicrophoneDuoStroke',
  'MicOff': 'PiMicrophoneOffDuoStroke',
  'Camera': 'PiCameraDefaultDuoStroke',
  'CameraOff': 'PiCameraOffDuoStroke',
  'Video': 'PiVideoCallDefaultDuoStroke',
  'VideoOff': 'PiVideoCallOffDuoStroke',
  'Wifi': 'PiWifiOnDuoStroke',
  'WifiOff': 'PiWifiOffDuoStroke',
  'Cloud': 'PiCloudCheckDuoStroke',
  'CloudOff': 'PiCloudDisabledDuoStroke',
  'MoreHorizontal': 'PiThreeDotsMenuHorizontalDuoStroke',
  'MoreVertical': 'PiThreeDotsMenuVerticalDuoStroke',
  'Menu': 'PiListDefaultDuoStroke',
  'Zap': 'PiZapBoltDuoStroke',
  'Activity': 'PiActivityDuoStroke',
  'Award': 'PiAwardMedalDuoStroke',
  'Flag': 'PiFlagDuoStroke',
  'Globe': 'PiGlobeDuoStroke',
  'Grid': 'PiGrid01DuoStroke',
  'HelpCircle': 'PiQuestionMarkCircleDuoStroke',
  'Layers': 'PiLayersStackedDuoStroke',
  'List': 'PiListDefaultDuoStroke',
  'LogOut': 'PiLogOutRightDuoStroke',
  'MessageCircle': 'PiMessageDefaultDuoStroke',
  'MessageSquare': 'PiChatDefaultDuoStroke',
  'PlusCircle': 'PiPlusCircleDuoStroke',
  'Power': 'PiPowerDefaultDuoStroke',
  'Printer': 'PiPrinterDuoStroke',
  'Share': 'PiShareDefaultDuoStroke',
  'Share2': 'PiShareDefaultDuoStroke',
  'ShoppingCart': 'PiShoppingCartDuoStroke',
  'Smartphone': 'PiPhoneDuoStroke',
  'Square': 'PiSquareDuoStroke',
  'Trash': 'PiDeleteDustbin01DuoStroke',
  'TrendingUp': 'PiTrendlineUpDuoStroke',
  'TrendingDown': 'PiTrendlineDownDuoStroke',
  'Type': 'PiTextParagraphDuoStroke',
  'Underline': 'PiUnderlineDuoStroke',
  'Unlock': 'PiLockOpenDuoStroke',
  'UserCheck': 'PiUserCheckDuoStroke',
  'UserMinus': 'PiUserMinusDuoStroke',
  'UserPlus': 'PiUserPlusDuoStroke',
  'UserX': 'PiUserCancelDuoStroke',
  'Users': 'PiUserGroupDuoStroke',
  'Wrench': 'PiWrenchDuoStroke',
  'ZoomIn': 'PiZoomInDuoStroke',
  'ZoomOut': 'PiZoomOutDuoStroke'
};

// Helper function to get Pika icon name from current icon name
export function getPikaIcon(currentIcon: string): string {
  return ICON_MAPPINGS[currentIcon] || currentIcon;
}

// Export individual Pika icon names for easy access
export const PIKA_ICONS = {
  // Common UI Icons
  CLOSE: 'PiXSolid',
  CHECK: 'PiCheckSolid',
  CHEVRON_DOWN: 'PiChevronDownSolid',
  CHEVRON_UP: 'PiChevronUpSolid',
  CHEVRON_LEFT: 'PiChevronLeftSolid',
  CHEVRON_RIGHT: 'PiChevronRightSolid',
  ARROW_DOWN: 'PiArrowDownSolid',
  ARROW_UP: 'PiArrowUpSolid',
  ARROW_LEFT: 'PiArrowLeftSolid',
  ARROW_RIGHT: 'PiArrowRightSolid',
  
  // Status Icons
  INFO: 'PiInformationCircleSolid',
  WARNING: 'PiAlertTriangleSolid',
  ERROR: 'PiAlertCircleSolid',
  SUCCESS: 'PiCheckCircleSolid',
  
  // Action Icons
  EDIT: 'PiPencilEditSolid',
  DELETE: 'PiTrashSolid',
  ADD: 'PiPlusSolid',
  SEARCH: 'PiMagnifyingGlassSolid',
  SAVE: 'PiFloppyDiskSolid',
  COPY: 'PiCopySolid',
  DOWNLOAD: 'PiArrowDownCircleSolid',
  UPLOAD: 'PiArrowUpCircleSolid',
  
  // File Icons
  FILE: 'PiFile02DefaultSolid',
  FILE_TEXT: 'PiFile02TextSolid',
  FOLDER: 'PiFolderDefaultSolid',
  
  // User Icons
  USER: 'PiUserSolid',
  USERS: 'PiUsersSolid',
  SETTINGS: 'PiGearSolid',
  LOGOUT: 'PiSignOutSolid',
  
  // Theme Icons
  SUN: 'PiSunSolid',
  MOON: 'PiMoonSolid',
  
  // Loading Icons
  SPINNER: 'PiSpinnerSolid',
  
  // AI Icons
  AI: 'PiAI01Solid',
  BRAIN: 'PiBrainSolid',
  SPARKLE: 'PiSparkleSolid',
  
  // Communication Icons
  MAIL: 'PiEnvelopeDefaultSolid',
  PHONE: 'PiPhoneDefaultSolid',
  MESSAGE: 'PiMessageDefaultSolid',
  CHAT: 'PiChatDefaultSolid',
  
  // Misc Icons
  MENU: 'PiListSolid',
  HOME: 'PiHomeDefaultSolid',
  CALENDAR: 'PiCalendarBlankSolid',
  CLOCK: 'PiClockSolid',
  LOCK: 'PiLockSolid',
  UNLOCK: 'PiLockOpenSolid',
  BELL: 'PiNotificationBellOnSolid',
  BELL_OFF: 'PiNotificationBellOffSolid',
  EYE: 'PiEyeSolid',
  EYE_OFF: 'PiEyeSlashSolid',
  STAR: 'PiStarSolid',
  HEART: 'PiHeartSolid',
  LINK: 'PiLinkSimpleSolid',
  SHIELD: 'PiShieldSolid',
  DATABASE: 'PiDatabaseSolid',
  SERVER: 'PiServerSolid',
  TERMINAL: 'PiTerminalConsoleSquareSolid',
  CODE: 'PiCodeSolid',
  GIT_BRANCH: 'PiGitBranchSolid',
  PACKAGE: 'PiPackage01Solid',
  
  // Navigation Icons
  MAP_PIN: 'PiMapPinSolid',
  NAVIGATION: 'PiNavigationSolid',
  
  // Media Icons
  CAMERA: 'PiCameraDefaultSolid',
  VIDEO: 'PiVideoCallDefaultSolid',
  MIC: 'PiMicrophoneSolid',
  SPEAKER: 'PiSpeakerOnSolid',
  
  // Others
  DOTS_HORIZONTAL: 'PiDotsThreeHorizontalSolid',
  DOTS_VERTICAL: 'PiDotsThreeVerticalSolid',
  GRID: 'PiGridSolid',
  LIST: 'PiListSolid',
  FILTER: 'PiFilterSolid',
  REFRESH: 'PiRefreshSolid',
  SHARE: 'PiShareNetworkSolid',
  PRINTER: 'PiPrinterSolid',
  WIFI: 'PiWifiSolid',
  CLOUD: 'PiCloudSolid',
  BOLT: 'PiBoltSolid',
  FLAG: 'PiFlagSolid',
  GLOBE: 'PiGlobeSolid',
  AWARD: 'PiAwardSolid',
  POWER: 'PiPowerSolid',
  SHOPPING_CART: 'PiShoppingCartSolid',
  WRENCH: 'PiWrenchSolid',
  ZOOM_IN: 'PiZoomInSolid',
  ZOOM_OUT: 'PiZoomOutSolid'
};