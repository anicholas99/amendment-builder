import React from 'react';

/**
 * PiCloudSunDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiCloudSunDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudSunDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-sun icon',
  ...props
}: PiCloudSunDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.582 2.27.022-.097M2.173 7.496l.097.022m3.015-4.43.054.085m9.588 2.166.084-.053M3.087 12.814l.085-.054m5.007.143a4 4 0 1 1 4.77-4.844 5.64 5.64 0 0 0-4.766 4.845z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.287 14.933a5.7 5.7 0 0 1-.136-1.71m0 0A3.9 3.9 0 0 0 8.57 21h8.667a4.767 4.767 0 0 0 1.879-9.149A5.636 5.636 0 0 0 8.15 13.222Z" fill="none"/>
    </svg>
  );
}
