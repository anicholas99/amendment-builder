import React from 'react';

/**
 * PiTimerPlusDuoSolid icon from the duo-solid style in time category.
 */
interface PiTimerPlusDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTimerPlusDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'timer-plus icon',
  ...props
}: PiTimerPlusDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10 1a1 1 0 0 0 0 2h1v2.055A9.001 9.001 0 0 0 12 23a9 9 0 0 0 1-17.945V3h1a1 1 0 1 0 0-2z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17v-3m0 0v-3m0 3H9m3 0h3m4.366-8.678 1.06 1.06"/>
    </svg>
  );
}
