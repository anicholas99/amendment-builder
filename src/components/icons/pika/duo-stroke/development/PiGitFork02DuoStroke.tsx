import React from 'react';

/**
 * PiGitFork02DuoStroke icon from the duo-stroke style in development category.
 */
interface PiGitFork02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitFork02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'git-fork-02 icon',
  ...props
}: PiGitFork02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15.5v-7m11.875-.002c-.154.604-.258.962-.409 1.268a4 4 0 0 1-2.746 2.144c-.417.09-.892.09-1.843.09h-.922c-1.435 0-2.153 0-2.787.219a4 4 0 0 0-1.495.923c-.475.466-.795 1.102-1.428 2.368" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 5.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/>
    </svg>
  );
}
