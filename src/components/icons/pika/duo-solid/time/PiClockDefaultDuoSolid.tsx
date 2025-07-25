import React from 'react';

/**
 * PiClockDefaultDuoSolid icon from the duo-solid style in time category.
 */
interface PiClockDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClockDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'clock-default icon',
  ...props
}: PiClockDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15c5.605 0 10.15-4.544 10.15-10.15S17.605 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7.9v4.916a.5.5 0 0 0 .232.422l2.812 1.79"/>
    </svg>
  );
}
