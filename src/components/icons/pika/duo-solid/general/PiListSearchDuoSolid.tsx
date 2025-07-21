import React from 'react';

/**
 * PiListSearchDuoSolid icon from the duo-solid style in general category.
 */
interface PiListSearchDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListSearchDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-search icon',
  ...props
}: PiListSearchDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 17a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"/></g><path fill={color || "currentColor"} d="M17.5 11c-2.21 0-4 1.79-4 4a3.998 3.998 0 0 0 6.032 3.446l.76.761a1 1 0 0 0 1.415-1.414l-.76-.761A3.998 3.998 0 0 0 17.5 11Z"/>
    </svg>
  );
}
