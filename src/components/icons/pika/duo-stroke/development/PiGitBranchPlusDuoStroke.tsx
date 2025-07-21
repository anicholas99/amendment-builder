import React from 'react';

/**
 * PiGitBranchPlusDuoStroke icon from the duo-stroke style in development category.
 */
interface PiGitBranchPlusDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitBranchPlusDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'git-branch-plus icon',
  ...props
}: PiGitBranchPlusDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 21v-3m0 0v-3m0 3h-3m3 0h3M6 15.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm15-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/>
    </svg>
  );
}
