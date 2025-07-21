import React from 'react';

/**
 * PiVolumeTwoDuoStroke icon from the duo-stroke style in media category.
 */
interface PiVolumeTwoDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVolumeTwoDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'volume-two icon',
  ...props
}: PiVolumeTwoDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 18.913V5.088c0-1.711-1.934-2.706-3.326-1.712L7.86 5.386a4.9 4.9 0 0 1-1.898.822A4.93 4.93 0 0 0 2 11.04v1.918a4.93 4.93 0 0 0 3.963 4.834 4.9 4.9 0 0 1 1.898.822l2.813 2.01c1.392.994 3.326-.001 3.326-1.712Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14c.317-.263.569-.574.74-.918.172-.343.26-.71.26-1.082 0-.371-.088-.74-.26-1.082A2.9 2.9 0 0 0 17 10m1 9c.786-.38 1.5-.939 2.102-1.642a7.8 7.8 0 0 0 1.405-2.459C21.832 13.98 22 12.996 22 12s-.168-1.98-.493-2.9a7.8 7.8 0 0 0-1.405-2.458A6.5 6.5 0 0 0 18 5" fill="none"/>
    </svg>
  );
}
