import React from 'react';

/**
 * PiResolutionQualityHqDuoStroke icon from the duo-stroke style in media category.
 */
interface PiResolutionQualityHqDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiResolutionQualityHqDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'resolution-quality-hq icon',
  ...props
}: PiResolutionQualityHqDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 4H7a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.754 8.75v3.5m0 0h3.5m-3.5 0v3m3.5-3v-3.5m0 3.5v3m5.168-.923v1.531m-1.668-5.56a1.75 1.75 0 0 1 3.5 0v2.28a1.75 1.75 0 0 1-3.5 0z" fill="none"/>
    </svg>
  );
}
