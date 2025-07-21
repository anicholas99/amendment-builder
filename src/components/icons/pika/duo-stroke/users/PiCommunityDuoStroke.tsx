import React from 'react';

/**
 * PiCommunityDuoStroke icon from the duo-stroke style in users category.
 */
interface PiCommunityDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCommunityDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'community icon',
  ...props
}: PiCommunityDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.656 10.618A5.7 5.7 0 0 1 7.328 8.19c1.932 0 3.639.959 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426c1.93 0 3.638.959 4.672 2.426M2.656 21a5.7 5.7 0 0 1 4.672-2.426c1.932 0 3.639.958 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426c1.93 0 3.638.958 4.672 2.426" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.732 5.596a2.596 2.596 0 1 1 5.192 0 2.596 2.596 0 0 1-5.192 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.077 5.596a2.596 2.596 0 1 1 5.19 0 2.596 2.596 0 0 1-5.19 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.732 15.978a2.596 2.596 0 1 1 5.192 0 2.596 2.596 0 0 1-5.192 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.077 15.978a2.596 2.596 0 1 1 5.19 0 2.596 2.596 0 0 1-5.19 0Z" fill="none"/>
    </svg>
  );
}
