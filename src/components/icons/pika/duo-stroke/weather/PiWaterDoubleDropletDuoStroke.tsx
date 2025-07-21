import React from 'react';

/**
 * PiWaterDoubleDropletDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiWaterDoubleDropletDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWaterDoubleDropletDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'water-double-droplet icon',
  ...props
}: PiWaterDoubleDropletDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 11.67c6.262 5.704 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.62 7.755C15.5 6.271 13.987 4.682 12 3-.083 13.224 5.36 19.992 10.775 20.896" opacity=".28" fill="none"/>
    </svg>
  );
}
