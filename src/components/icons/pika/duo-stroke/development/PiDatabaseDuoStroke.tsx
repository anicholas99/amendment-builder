import React from 'react';

/**
 * PiDatabaseDuoStroke icon from the duo-stroke style in development category.
 */
interface PiDatabaseDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDatabaseDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'database icon',
  ...props
}: PiDatabaseDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17h.01M20 12v6.131C20 19.716 16.418 21 12 21s-8-1.284-8-2.869V12c0 1.491 3.582 2.7 8 2.7s8-1.209 8-2.7Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 5.7V12c0 1.491-3.582 2.7-8 2.7S4 13.491 4 12V5.7m16 0c0 1.491-3.582 2.7-8 2.7S4 7.191 4 5.7m16 0C20 4.209 16.418 3 12 3S4 4.209 4 5.7M16 11h.01" fill="none"/>
    </svg>
  );
}
