import React from 'react';

/**
 * PiFloorLampOffDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiFloorLampOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFloorLampOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'floor-lamp-off icon',
  ...props
}: PiFloorLampOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21V10M9 21h6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.937 4.351A2 2 0 0 1 9.829 3h4.342a2 2 0 0 1 1.892 1.351L18 10H6z" fill="none"/>
    </svg>
  );
}
