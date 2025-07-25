import React from 'react';

/**
 * PiThermometerAddDuoStroke icon from the duo-stroke style in general category.
 */
interface PiThermometerAddDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThermometerAddDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'thermometer-add icon',
  ...props
}: PiThermometerAddDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10V7m0 0V4m0 3H2m3 0h3" fill="none"/>
    </svg>
  );
}
