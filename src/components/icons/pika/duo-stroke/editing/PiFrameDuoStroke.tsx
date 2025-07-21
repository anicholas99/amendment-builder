import React from 'react';

/**
 * PiFrameDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiFrameDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFrameDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'frame icon',
  ...props
}: PiFrameDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 17h-4v4m0-18v4h4M3 7h4V3m0 18v-4H3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17V7H7v10z" fill="none"/>
    </svg>
  );
}
