import React from 'react';

/**
 * PiCodeDuoStroke icon from the duo-stroke style in development category.
 */
interface PiCodeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCodeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'code icon',
  ...props
}: PiCodeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 18a28.2 28.2 0 0 0 4.848-5.49.93.93 0 0 0 0-1.02A28.2 28.2 0 0 0 17 6M7.004 18a28.2 28.2 0 0 1-4.848-5.49.93.93 0 0 1 0-1.02A28.2 28.2 0 0 1 7.004 6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.004 4.001-4 16" fill="none"/>
    </svg>
  );
}
