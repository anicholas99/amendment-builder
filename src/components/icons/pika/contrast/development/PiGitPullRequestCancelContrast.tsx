import React from 'react';

/**
 * PiGitPullRequestCancelContrast icon from the contrast style in development category.
 */
interface PiGitPullRequestCancelContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitPullRequestCancelContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'git-pull-request-cancel icon',
  ...props
}: PiGitPullRequestCancelContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M21 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" fill="none" stroke="currentColor"/><path d="M9 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 6v-2m0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-2.5-6.7 2.4-2.4m0 0 2.4-2.4m-2.4 2.4-2.4-2.4m2.4 2.4 2.4 2.4" fill="none"/>
    </svg>
  );
}
