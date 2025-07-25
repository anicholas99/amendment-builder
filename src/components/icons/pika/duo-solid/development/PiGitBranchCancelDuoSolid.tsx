import React from 'react';

/**
 * PiGitBranchCancelDuoSolid icon from the duo-solid style in development category.
 */
interface PiGitBranchCancelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitBranchCancelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'git-branch-cancel icon',
  ...props
}: PiGitBranchCancelDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9" opacity=".28"/><path fill={color || "currentColor"} d="M14 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/><path fill={color || "currentColor"} d="M2 18.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/><path fill={color || "currentColor"} d="M16.707 15.793a1 1 0 0 0-1.414 1.414l1.693 1.693-1.693 1.693a1 1 0 0 0 1.414 1.414l1.693-1.693 1.693 1.693a1 1 0 0 0 1.414-1.414L19.814 18.9l1.693-1.693a1 1 0 0 0-1.414-1.414L18.4 17.486z"/>
    </svg>
  );
}
