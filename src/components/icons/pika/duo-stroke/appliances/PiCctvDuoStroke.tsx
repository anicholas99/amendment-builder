import React from 'react';

/**
 * PiCctvDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiCctvDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCctvDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'cctv icon',
  ...props
}: PiCctvDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.323 4.932a2 2 0 0 1 2.45-1.414l10.904 2.921a1 1 0 0 1 .707 1.225l-1.323 4.937a1 1 0 0 1-1.225.707L4.932 10.386a2 2 0 0 1-1.414-2.45z" opacity=".28" fill="none"/><path fill="none" d="m8.558 12.393 1.937.52-1.355 3.86a2 2 0 0 1-1.559 1.31l-4.58.764V21a1 1 0 1 1-2 0v-6a1 1 0 1 1 2 0v1.82l4.252-.71z"/><path fill="none" d="M22.21 8.971a1 1 0 0 0-1.932-.518l-1.294 4.83a1 1 0 0 0 1.932.518z"/>
    </svg>
  );
}
