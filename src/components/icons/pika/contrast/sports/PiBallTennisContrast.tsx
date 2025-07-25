import React from 'react';

/**
 * PiBallTennisContrast icon from the contrast style in sports category.
 */
interface PiBallTennisContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBallTennisContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'ball-tennis icon',
  ...props
}: PiBallTennisContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M9.633 20.838a9.13 9.13 0 0 0 7.838-1.502 9.1 9.1 0 0 0 3.368-4.968 9.1 9.1 0 0 0-.433-5.986 9.13 9.13 0 0 0-6.037-5.22 9.13 9.13 0 0 0-7.838 1.503 9.1 9.1 0 0 0-3.368 4.967 9.1 9.1 0 0 0 .433 5.986 9.13 9.13 0 0 0 6.037 5.22Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.405 8.382a6.003 6.003 0 0 0-2.935 10.954m2.935-10.954a9.13 9.13 0 0 0-6.037-5.22A9.13 9.13 0 0 0 6.53 4.665m13.875 3.717a9.1 9.1 0 0 1 .433 5.986 9.1 9.1 0 0 1-3.368 4.968m0 0a9.13 9.13 0 0 1-7.838 1.502 9.13 9.13 0 0 1-6.037-5.22M6.53 4.665a6.002 6.002 0 0 1-2.935 10.953M6.53 4.665a9.1 9.1 0 0 0-3.368 4.967 9.1 9.1 0 0 0 .433 5.986" fill="none"/>
    </svg>
  );
}
