import React from 'react';

/**
 * PiSpinnerDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSpinnerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpinnerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'spinner icon',
  ...props
}: PiSpinnerDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.078 19.079 16.25 16.25M19.078 5 16.25 7.828M4.92 19.078l2.83-2.828M4.92 5l2.83 2.828" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12H2m20 0h-4M12 2v4m0 12v4" fill="none"/>
    </svg>
  );
}
