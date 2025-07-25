import React from 'react';

/**
 * PiSteeringWheelDuoStroke icon from the duo-stroke style in automotive category.
 */
interface PiSteeringWheelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSteeringWheelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'steering-wheel icon',
  ...props
}: PiSteeringWheelDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.15 12a9.15 9.15 0 1 0-18.3 0 9.15 9.15 0 0 0 18.3 0Z" opacity=".28" fill="none"/><path fill="none" d="M13.1 12a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 1 0 2.2 0z"/><path fill="none" fillRule="evenodd" d="M19.85 9.805A17 17 0 0 0 12 7.9c-2.83 0-5.5.688-7.851 1.905a8.2 8.2 0 0 0-.222 3.32q.283-.024.573-.025a6.4 6.4 0 0 1 6.374 6.973 8.2 8.2 0 0 0 2.25 0 6.4 6.4 0 0 1 6.948-6.948 8.2 8.2 0 0 0-.221-3.32ZM12 15.29a8.62 8.62 0 0 0-5.479-4.15A14.9 14.9 0 0 1 12 10.1c1.935 0 3.783.369 5.478 1.039A8.62 8.62 0 0 0 12 15.289Z" clipRule="evenodd"/>
    </svg>
  );
}
