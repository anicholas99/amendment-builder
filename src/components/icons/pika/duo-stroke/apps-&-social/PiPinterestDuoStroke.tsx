import React from 'react';

/**
 * PiPinterestDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiPinterestDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPinterestDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'pinterest icon',
  ...props
}: PiPinterestDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.141 14.374a7.918 7.918 0 1 1 14.777-3.96c0 4.374-3.167 7.127-6.334 7.127-2.959 0-4.075-2.073-4.21-2.346" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.944 7.775 8.041 21.5" fill="none"/>
    </svg>
  );
}
