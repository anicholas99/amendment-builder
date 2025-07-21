import React from 'react';

/**
 * PiAnimation01DuoStroke icon from the duo-stroke style in media category.
 */
interface PiAnimation01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAnimation01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'animation-01 icon',
  ...props
}: PiAnimation01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.686 15.018a5.1 5.1 0 0 1-4.771 3.081M8.983 8.314A5.1 5.1 0 0 0 5.9 13.086m0 0a4.102 4.102 0 0 0 1.05 8.064 4.1 4.1 0 0 0 3.964-3.05M5.9 13.084a5.1 5.1 0 0 0 5.014 5.014" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.95 8.95a6.1 6.1 0 1 1 12.2 0 6.1 6.1 0 0 1-12.2 0Z" fill="none"/>
    </svg>
  );
}
