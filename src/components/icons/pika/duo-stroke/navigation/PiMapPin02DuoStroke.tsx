import React from 'react';

/**
 * PiMapPin02DuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiMapPin02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapPin02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'map-pin-02 icon',
  ...props
}: PiMapPin02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21v-8" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" fill="none"/>
    </svg>
  );
}
