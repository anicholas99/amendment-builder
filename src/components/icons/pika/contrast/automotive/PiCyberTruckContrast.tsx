import React from 'react';

/**
 * PiCyberTruckContrast icon from the contrast style in automotive category.
 */
interface PiCyberTruckContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCyberTruckContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'cyber-truck icon',
  ...props
}: PiCyberTruckContrastProps): JSX.Element {
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
      <path fill="currentColor" d="m22.5 10-.5 5h-2a2 2 0 1 0-4 0H8a2 2 0 1 0-4 0H1v-3l9-5z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m4 0h8M4 15H1v-3l9-5 12.5 3-.5 5h-2m0 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0" fill="none"/>
    </svg>
  );
}
