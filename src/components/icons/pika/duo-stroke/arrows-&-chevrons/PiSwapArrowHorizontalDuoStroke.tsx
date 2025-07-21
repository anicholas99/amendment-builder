import React from 'react';

/**
 * PiSwapArrowHorizontalDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiSwapArrowHorizontalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwapArrowHorizontalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'swap-arrow-horizontal icon',
  ...props
}: PiSwapArrowHorizontalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16h14m4-8H7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.887 12a20.2 20.2 0 0 0-3.747 3.604.63.63 0 0 0 0 .792A20.2 20.2 0 0 0 6.887 20M17.113 4a20.2 20.2 0 0 1 3.747 3.604.63.63 0 0 1 0 .792A20.2 20.2 0 0 1 17.113 12" fill="none"/>
    </svg>
  );
}
