import React from 'react';

/**
 * PiDownloadDownDuoStroke icon from the duo-stroke style in general category.
 */
interface PiDownloadDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDownloadDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'download-down icon',
  ...props
}: PiDownloadDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.189a15 15 0 0 0 2.556 2.654A.7.7 0 0 0 12 15m3-2.812a15 15 0 0 1-2.556 2.655A.7.7 0 0 1 12 15m0 0V4" fill="none"/>
    </svg>
  );
}
