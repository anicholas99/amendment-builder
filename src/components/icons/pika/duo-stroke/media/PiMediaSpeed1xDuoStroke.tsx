import React from 'react';

/**
 * PiMediaSpeed1xDuoStroke icon from the duo-stroke style in media category.
 */
interface PiMediaSpeed1xDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMediaSpeed1xDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'media-speed-1x icon',
  ...props
}: PiMediaSpeed1xDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.022 19V5c-1.805.442-3.185 1.685-4.003 3.323" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13 19 3.5-4.5m0 0L20 10m-3.5 4.5L20 19m-3.5-4.5L13 10" opacity=".28" fill="none"/>
    </svg>
  );
}
