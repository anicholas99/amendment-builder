import React from 'react';

/**
 * PiTiktokDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiTiktokDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTiktokDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'tiktok icon',
  ...props
}: PiTiktokDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.989 2v15.556a4.444 4.444 0 1 1-4.444-4.445" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.989 2 .85 1.912a6.28 6.28 0 0 0 4.705 3.644" fill="none"/>
    </svg>
  );
}
