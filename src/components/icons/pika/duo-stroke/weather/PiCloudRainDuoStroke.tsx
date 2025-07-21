import React from 'react';

/**
 * PiCloudRainDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiCloudRainDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudRainDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-rain icon',
  ...props
}: PiCloudRainDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.017 9.026A7 7 0 0 0 6 9.5m.017-.474a4.5 4.5 0 0 0-1.758 8.377m1.758-8.377a6.5 6.5 0 0 1 12.651-1.582 5.5 5.5 0 0 1 1.252 9.364" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v2m4-1v2m4-3v2m-8 3v1m4 0v1m4-2v1" fill="none"/>
    </svg>
  );
}
