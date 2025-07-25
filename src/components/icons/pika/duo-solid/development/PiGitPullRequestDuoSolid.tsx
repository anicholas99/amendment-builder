import React from 'react';

/**
 * PiGitPullRequestDuoSolid icon from the duo-solid style in development category.
 */
interface PiGitPullRequestDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitPullRequestDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'git-pull-request icon',
  ...props
}: PiGitPullRequestDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v12m12-6v-4a5 5 0 0 0-5-5" opacity=".28"/><path fill={color || "currentColor"} d="M6 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path fill={color || "currentColor"} d="M18 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
    </svg>
  );
}
