import React from 'react';

/**
 * PiMathDuoStroke icon from the duo-stroke style in maths category.
 */
interface PiMathDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMathDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'math icon',
  ...props
}: PiMathDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11V7m0 0V3m0 4h-4m4 0h4M3 21l3-3m0 0 3-3m-3 3-3-3m3 3 3 3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h6m5 9h7m-7 4h7" fill="none"/>
    </svg>
  );
}
