import React from 'react';

/**
 * PiMarkdownDuoStroke icon from the duo-stroke style in development category.
 */
interface PiMarkdownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMarkdownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'markdown icon',
  ...props
}: PiMarkdownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 4 7.16 4 9.4 4h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 7.04 21 8.16 21 10.4v3.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 20 16.84 20 14.6 20H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 16.96 3 15.84 3 13.6z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15V9l2.5 3L11 9v6m3-1.874a10 10 0 0 0 1.704 1.77A.48.48 0 0 0 16 15m2-1.874a10 10 0 0 1-1.704 1.77A.47.47 0 0 1 16 15m0 0V9" fill="none"/>
    </svg>
  );
}
