import React from 'react';

/**
 * PiToggleOffDuoSolid icon from the duo-solid style in general category.
 */
interface PiToggleOffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiToggleOffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'toggle-off icon',
  ...props
}: PiToggleOffDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M15.903 4a8 8 0 0 1 0 16h-6a8 8 0 0 1 0-16z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M9.903 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" clipRule="evenodd"/>
    </svg>
  );
}
