import React from 'react';

/**
 * PiListArrowDownDuoSolid icon from the duo-solid style in general category.
 */
interface PiListArrowDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListArrowDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-arrow-down icon',
  ...props
}: PiListArrowDownDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 11a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 17a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z"/></g><path fill={color || "currentColor"} d="M20 11.5a1 1 0 1 0-2 0v3.9a36 36 0 0 1-1.017-.11q-.422-.05-.882-.1a1 1 0 0 0-.901 1.596 16 16 0 0 0 2.727 2.83 1.7 1.7 0 0 0 2.146 0 16 16 0 0 0 2.727-2.83 1 1 0 0 0-.9-1.595q-.46.048-.883.099c-.35.041-.686.08-1.017.11z"/>
    </svg>
  );
}
