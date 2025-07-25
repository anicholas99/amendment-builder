import React from 'react';

/**
 * PiDoorContrast icon from the contrast style in building category.
 */
interface PiDoorContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDoorContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'door icon',
  ...props
}: PiDoorContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M5 17V7c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.093C6.9 3 7.6 3 9 3h6c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093C19 4.9 19 5.6 19 7v10c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092C17.1 21 16.4 21 15 21H9c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C5 19.1 5 18.4 5 17Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 21h20" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 21V7c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.093C6.9 3 7.6 3 9 3h6c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093C19 4.9 19 5.6 19 7v14" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 12H8" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" fill="none"/>
    </svg>
  );
}
