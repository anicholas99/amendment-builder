import React from 'react';

/**
 * PiWaterDropletDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiWaterDropletDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWaterDropletDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'water-droplet icon',
  ...props
}: PiWaterDropletDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3c13 11 5.712 18 0 18s-13-7 0-18Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.257 14c.218 4.446-3.807 7-7.257 7s-7.475-2.554-7.257-7" fill="none"/>
    </svg>
  );
}
