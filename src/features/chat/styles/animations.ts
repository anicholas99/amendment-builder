import { keyframes } from '@emotion/react';

// Animation for thinking dots
export const thinkingDots = keyframes`
  0%, 20% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.8); }
`;

// Subtle pulse animation
export const subtlePulse = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

// Fade in up animation
export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Smooth cursor animation using hardware-accelerated properties
export const streamingPulse = keyframes`
  0%, 100% { 
    opacity: 0.95; 
    transform: scaleY(1);
  }
  50% { 
    opacity: 0.6; 
    transform: scaleY(0.95);
  }
`;

// Subtle text reveal animation for better visual flow
export const textReveal = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(2px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

// Smooth text flow for streaming content
export const textFlow = keyframes`
  from { opacity: 0.7; }
  to { opacity: 1; }
`;
