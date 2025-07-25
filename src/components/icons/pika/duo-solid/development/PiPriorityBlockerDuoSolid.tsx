import React from 'react';

/**
 * PiPriorityBlockerDuoSolid icon from the duo-solid style in development category.
 */
interface PiPriorityBlockerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPriorityBlockerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'priority-blocker icon',
  ...props
}: PiPriorityBlockerDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.5 15.5 7-7"/>
    </svg>
  );
}
