import React from 'react';

/**
 * PiBotDuoStroke icon from the duo-stroke style in users category.
 */
interface PiBotDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBotDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bot icon',
  ...props
}: PiBotDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v5m0 0h-2c-1.861 0-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21C3 11.208 3 12.139 3 14s0 2.792.245 3.545a5 5 0 0 0 3.21 3.21C7.208 21 8.139 21 10 21h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 16.792 21 15.861 21 14s0-2.792-.245-3.545a5 5 0 0 0-3.21-3.21C16.792 7 15.861 7 14 7z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/>
    </svg>
  );
}
