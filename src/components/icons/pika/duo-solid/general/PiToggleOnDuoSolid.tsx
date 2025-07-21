import React from 'react';

/**
 * PiToggleOnDuoSolid icon from the duo-solid style in general category.
 */
interface PiToggleOnDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiToggleOnDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'toggle-on icon',
  ...props
}: PiToggleOnDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M9.903 4a8 8 0 1 0 0 16h6a8 8 0 0 0 0-16z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M15.903 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" clipRule="evenodd"/>
    </svg>
  );
}
