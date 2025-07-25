import React from 'react';

/**
 * PiGitPullRequestDraftContrast icon from the contrast style in development category.
 */
interface PiGitPullRequestDraftContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitPullRequestDraftContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'git-pull-request-draft icon',
  ...props
}: PiGitPullRequestDraftContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M21 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" fill="none" stroke="currentColor"/><path d="M9 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 4v2m0 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-5-9q.514 0 1 .1M17 8q.348.462.584 1" fill="none"/>
    </svg>
  );
}
