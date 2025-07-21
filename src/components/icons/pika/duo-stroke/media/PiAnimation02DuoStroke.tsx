import React from 'react';

/**
 * PiAnimation02DuoStroke icon from the duo-stroke style in media category.
 */
interface PiAnimation02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAnimation02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'animation-02 icon',
  ...props
}: PiAnimation02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14a5 5 0 0 1 5 5v-1a9 9 0 0 1 5.237-8.178" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" fill="none"/>
    </svg>
  );
}
