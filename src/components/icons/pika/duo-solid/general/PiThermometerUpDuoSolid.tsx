import React from 'react';

/**
 * PiThermometerUpDuoSolid icon from the duo-solid style in general category.
 */
interface PiThermometerUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThermometerUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'thermometer-up icon',
  ...props
}: PiThermometerUpDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M15 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.572 8.41a13 13 0 0 0-2.19-2.275A.6.6 0 0 0 5 6m0 0a.6.6 0 0 0-.38.135A13 13 0 0 0 2.429 8.41M5.001 6v6.429"/>
    </svg>
  );
}
