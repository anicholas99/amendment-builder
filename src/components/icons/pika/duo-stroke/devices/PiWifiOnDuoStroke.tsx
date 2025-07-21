import React from 'react';

/**
 * PiWifiOnDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiWifiOnDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWifiOnDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'wifi-on icon',
  ...props
}: PiWifiOnDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22.806 8.7A15.94 15.94 0 0 0 12 4.5c-4.166 0-7.96 1.592-10.807 4.2m14.505 7.075A5.97 5.97 0 0 0 12 14.5c-1.416 0-2.718.49-3.745 1.312" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19.5h.01m-7.278-7.257A10.96 10.96 0 0 1 12 9.5a10.96 10.96 0 0 1 7.268 2.743" fill="none"/>
    </svg>
  );
}
