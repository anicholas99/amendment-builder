import React from 'react';

/**
 * PiAcLeafDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiAcLeafDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAcLeafDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'ac-leaf icon',
  ...props
}: PiAcLeafDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 4H4a2 2 0 0 0-2 2v6h20V6a2 2 0 0 0-2-2Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8h-2m-1.198 14 .04-.11a6.13 6.13 0 0 1 2.317-2.963m-.482-2.855c-1.472.85-2.025 2.65-1.383 3.76.64 1.11 2.476 1.532 3.948.682s3.037-3.974 2.716-4.53c-.32-.555-3.809-.762-5.281.088Z" fill="none"/>
    </svg>
  );
}
