import React from 'react';

/**
 * PiFloorLampOnDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiFloorLampOnDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFloorLampOnDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'floor-lamp-on icon',
  ...props
}: PiFloorLampOnDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21V10M9 21h6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 13-1 2m9-2 1 2m1-5-1.937-5.649A2 2 0 0 0 14.171 3H9.83a2 2 0 0 0-1.892 1.351L6 10z" fill="none"/>
    </svg>
  );
}
