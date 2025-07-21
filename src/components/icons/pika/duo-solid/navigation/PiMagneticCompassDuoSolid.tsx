import React from 'react';

/**
 * PiMagneticCompassDuoSolid icon from the duo-solid style in navigation category.
 */
interface PiMagneticCompassDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMagneticCompassDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'magnetic-compass icon',
  ...props
}: PiMagneticCompassDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15c5.605 0 10.15-4.544 10.15-10.15S17.605 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M16.246 9.635a1.77 1.77 0 0 0-1.881-1.881 7.08 7.08 0 0 0-6.611 6.61 1.77 1.77 0 0 0 1.882 1.882 7.08 7.08 0 0 0 6.61-6.61Z"/>
    </svg>
  );
}
