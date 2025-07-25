import React from 'react';

/**
 * PiSteeringWheelDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiSteeringWheelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSteeringWheelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'steering-wheel icon',
  ...props
}: PiSteeringWheelDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.15 12a9.15 9.15 0 1 0-18.3 0 9.15 9.15 0 0 0 18.3 0Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M19.886 9.936A16.9 16.9 0 0 0 12 8c-2.846 0-5.53.7-7.887 1.936a8.2 8.2 0 0 0-.2 3.09Q4.204 13 4.5 13a6.5 6.5 0 0 1 6.474 7.086 8.2 8.2 0 0 0 2.052 0 6.5 6.5 0 0 1 7.06-7.06 8.2 8.2 0 0 0-.2-3.09ZM12 10.9a1.1 1.1 0 0 1 1.1 1.1v.01a1.1 1.1 0 0 1-2.2 0V12a1.1 1.1 0 0 1 1.1-1.1Z" clipRule="evenodd"/>
    </svg>
  );
}
