import React from 'react';

/**
 * PiCyberTruckDuoStroke icon from the duo-stroke style in automotive category.
 */
interface PiCyberTruckDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCyberTruckDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'cyber-truck icon',
  ...props
}: PiCyberTruckDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m22.5 10-.5 5h-2a2 2 0 1 0-4 0H8a2 2 0 1 0-4 0H1v-3l9-5z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none"/>
    </svg>
  );
}
