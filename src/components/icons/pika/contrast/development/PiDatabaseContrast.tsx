import React from 'react';

/**
 * PiDatabaseContrast icon from the contrast style in development category.
 */
interface PiDatabaseContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDatabaseContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'database icon',
  ...props
}: PiDatabaseContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20 5.7c0 1.491-3.582 2.7-8 2.7S4 7.191 4 5.7v12.43C4 19.716 7.582 21 12 21s8-1.284 8-2.869z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 5.7V12m0-6.3c0 1.491-3.582 2.7-8 2.7S4 7.191 4 5.7m16 0C20 4.209 16.418 3 12 3S4 4.209 4 5.7M20 12v6.131C20 19.716 16.418 21 12 21s-8-1.284-8-2.869V12m16 0c0 1.491-3.582 2.7-8 2.7S4 13.491 4 12m0 0V5.7M16 11h.01M16 17h.01" fill="none"/>
    </svg>
  );
}
