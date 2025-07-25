import React from 'react';

/**
 * PiSpatialScreenDuoStroke icon from the duo-stroke style in ar-&-vr category.
 */
interface PiSpatialScreenDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpatialScreenDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'spatial-screen icon',
  ...props
}: PiSpatialScreenDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21h-5m-9-7V7" opacity=".35" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.4V5.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 4 19.96 4 19.4 4H6.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C5 4.76 5 5.04 5 5.6v9.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C5.76 17 6.04 17 6.6 17h12.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 16.24 21 15.96 21 15.4Z" fill="none"/>
    </svg>
  );
}
