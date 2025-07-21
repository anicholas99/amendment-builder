import React from 'react';

/**
 * PiSwapHalfarrowVerticalDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiSwapHalfarrowVerticalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwapHalfarrowVerticalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'swap-halfarrow-vertical icon',
  ...props
}: PiSwapHalfarrowVerticalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3v15m4 3V6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6.887A20.2 20.2 0 0 1 9.604 3.14.63.63 0 0 1 10 3m8 14.113a20.2 20.2 0 0 1-3.604 3.747A.63.63 0 0 1 14 21" fill="none"/>
    </svg>
  );
}
