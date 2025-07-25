import React from 'react';

/**
 * PiGitBranchDuoSolid icon from the duo-solid style in development category.
 */
interface PiGitBranchDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitBranchDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'git-branch icon',
  ...props
}: PiGitBranchDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9" opacity=".28"/><path fill={color || "currentColor"} d="M18 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path fill={color || "currentColor"} d="M6 14.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
    </svg>
  );
}
