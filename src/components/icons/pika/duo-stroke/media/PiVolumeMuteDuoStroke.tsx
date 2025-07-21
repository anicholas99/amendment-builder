import React from 'react';

/**
 * PiVolumeMuteDuoStroke icon from the duo-stroke style in media category.
 */
interface PiVolumeMuteDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVolumeMuteDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'volume-mute icon',
  ...props
}: PiVolumeMuteDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 18.913V5.088c0-1.711-1.934-2.706-3.326-1.712L7.86 5.386a4.9 4.9 0 0 1-1.898.822A4.93 4.93 0 0 0 2 11.04v1.918a4.93 4.93 0 0 0 3.963 4.834 4.9 4.9 0 0 1 1.898.822l2.813 2.01c1.392.994 3.326-.001 3.326-1.712Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m22 10-2.5 2.5m0 0L17 15m2.5-2.5L22 15m-2.5-2.5L17 10" fill="none"/>
    </svg>
  );
}
