import React from 'react';

/**
 * PiAcWaterDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiAcWaterDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAcWaterDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ac-water icon',
  ...props
}: PiAcWaterDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M4 3a3 3 0 0 0-3 3v6a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8h-2m3.8 11.2a2.8 2.8 0 0 1-5.6 0c0-1.546 2.1-4.2 2.8-4.2s2.8 2.654 2.8 4.2Z"/>
    </svg>
  );
}
