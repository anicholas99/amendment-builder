import React from 'react';

/**
 * PiCopyCopiedDuoStroke icon from the duo-stroke style in general category.
 */
interface PiCopyCopiedDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCopyCopiedDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'copy-copied icon',
  ...props
}: PiCopyCopiedDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.902 16.902a4 4 0 0 0 .643-.147 5 5 0 0 0 3.21-3.21C21 12.792 21 11.861 21 10s0-2.792-.245-3.545a5 5 0 0 0-3.21-3.21C16.792 3 15.861 3 14 3s-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21 4 4 0 0 0-.147.643" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 14.259 2.036 2.034A13 13 0 0 1 13 12m-3 9c-1.861 0-2.792 0-3.545-.245a5 5 0 0 1-3.21-3.21C3 16.792 3 15.861 3 14s0-2.792.245-3.545a5 5 0 0 1 3.21-3.21C7.208 7 8.139 7 10 7s2.792 0 3.545.245a5 5 0 0 1 3.21 3.21C17 11.208 17 12.139 17 14s0 2.792-.245 3.545a5 5 0 0 1-3.21 3.21C12.792 21 11.861 21 10 21Z" fill="none"/>
    </svg>
  );
}
