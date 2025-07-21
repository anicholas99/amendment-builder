import React from 'react';

/**
 * PiScissorsLeftDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScissorsLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScissorsLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scissors-left icon',
  ...props
}: PiScissorsLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.4 12 3 3.6m8.4 8.4 3.454 3.454M11.4 12l3.454-3.455M11.4 12 3 20.4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.854 15.455a3.6 3.6 0 1 1 5.091 5.091 3.6 3.6 0 0 1-5.09-5.091Zm0-6.91a3.6 3.6 0 1 1 5.091-5.09 3.6 3.6 0 0 1-5.09 5.09Z" fill="none"/>
    </svg>
  );
}
