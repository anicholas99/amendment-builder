import React from 'react';

/**
 * PiWifiOffDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiWifiOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWifiOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'wifi-off icon',
  ...props
}: PiWifiOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19.5h.01M1.193 8.7A15.94 15.94 0 0 1 12 4.5c2.213 0 4.321.45 6.238 1.262M4.732 12.243A10.96 10.96 0 0 1 12 9.5c.777 0 1.535.08 2.266.234M14.402 15a6 6 0 0 1 1.296.775m5.96-8.032q.597.453 1.148.958m-4.732 2.627q.63.418 1.194.915" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.385 20.615 21 3" fill="none"/>
    </svg>
  );
}
