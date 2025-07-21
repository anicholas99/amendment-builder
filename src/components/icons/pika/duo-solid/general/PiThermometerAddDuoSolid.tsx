import React from 'react';

/**
 * PiThermometerAddDuoSolid icon from the duo-solid style in general category.
 */
interface PiThermometerAddDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThermometerAddDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'thermometer-add icon',
  ...props
}: PiThermometerAddDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M15 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10V7m0 0V4m0 3H2m3 0h3"/>
    </svg>
  );
}
