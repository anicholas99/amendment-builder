import React from 'react';

/**
 * PiSwapArrowVerticalDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiSwapArrowVerticalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwapArrowVerticalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'swap-arrow-vertical icon',
  ...props
}: PiSwapArrowVerticalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21V7M8 3v14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.113a20.2 20.2 0 0 0 3.604 3.747.63.63 0 0 0 .792 0A20.2 20.2 0 0 0 20 17.113M4 6.887A20.2 20.2 0 0 1 7.604 3.14a.63.63 0 0 1 .792 0A20.2 20.2 0 0 1 12 6.887" fill="none"/>
    </svg>
  );
}
