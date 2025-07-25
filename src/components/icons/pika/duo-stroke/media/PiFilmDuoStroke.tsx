import React from 'react';

/**
 * PiFilmDuoStroke icon from the duo-stroke style in media category.
 */
interface PiFilmDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFilmDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'film icon',
  ...props
}: PiFilmDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.952 8H16M8 8H3.048m17.904 8H16m-8 0H3.048M21 12H3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 3h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 5.73C3 6.8 3 8.2 3 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C6.8 21 8.2 21 11 21h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3.048v17.904m8-17.904v17.904" fill="none"/>
    </svg>
  );
}
