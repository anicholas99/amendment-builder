import React from 'react';

/**
 * PiTimerRemoveDuoSolid icon from the duo-solid style in time category.
 */
interface PiTimerRemoveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTimerRemoveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'timer-remove icon',
  ...props
}: PiTimerRemoveDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10 1a1 1 0 0 0 0 2h1v2.055A9.001 9.001 0 0 0 12 23a9 9 0 0 0 1-17.945V3h1a1 1 0 1 0 0-2z" opacity=".28"/><path fill={color || "currentColor"} d="M20.074 4.615a1 1 0 1 0-1.414 1.414l1.06 1.06a1 1 0 1 0 1.415-1.414z"/><path fill={color || "currentColor"} d="M8.9 13.003a1 1 0 0 0 0 2h6.2a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
