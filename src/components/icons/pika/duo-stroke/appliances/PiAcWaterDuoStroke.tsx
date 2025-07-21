import React from 'react';

/**
 * PiAcWaterDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiAcWaterDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAcWaterDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'ac-water icon',
  ...props
}: PiAcWaterDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 4H4a2 2 0 0 0-2 2v6h20V6a2 2 0 0 0-2-2Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8h-2m3.8 11.2a2.8 2.8 0 0 1-5.6 0c0-1.546 2.1-4.2 2.8-4.2s2.8 2.654 2.8 4.2Z" fill="none"/>
    </svg>
  );
}
