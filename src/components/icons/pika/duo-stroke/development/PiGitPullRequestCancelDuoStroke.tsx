import React from 'react';

/**
 * PiGitPullRequestCancelDuoStroke icon from the duo-stroke style in development category.
 */
interface PiGitPullRequestCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitPullRequestCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'git-pull-request-cancel icon',
  ...props
}: PiGitPullRequestCancelDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v12m12-6v-2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15.5 8.3 2.4-2.4m0 0 2.4-2.4m-2.4 2.4-2.4-2.4m2.4 2.4 2.4 2.4M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm15 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" fill="none"/>
    </svg>
  );
}
