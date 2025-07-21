import React from 'react';

/**
 * PiThermometerDuoSolid icon from the duo-solid style in general category.
 */
interface PiThermometerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThermometerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'thermometer icon',
  ...props
}: PiThermometerDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"/>
    </svg>
  );
}
