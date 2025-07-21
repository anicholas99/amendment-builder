import React from 'react';

/**
 * PiGitCompareDuoStroke icon from the duo-stroke style in development category.
 */
interface PiGitCompareDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitCompareDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'git-compare icon',
  ...props
}: PiGitCompareDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15v-4a5 5 0 0 0-5-5M6 9v4a5 5 0 0 0 5 5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" fill="none"/>
    </svg>
  );
}
