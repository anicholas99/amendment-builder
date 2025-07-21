import React from 'react';

/**
 * PiIpadDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiIpadDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiIpadDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'ipad icon',
  ...props
}: PiIpadDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 2h-.6c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 5.04 3 6.16 3 8.4v7.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 22 7.16 22 9.4 22h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 18.96 21 17.84 21 15.6V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 2 16.84 2 14.6 2H14m-4 0h4m-4 0v1h4V2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19h4" fill="none"/>
    </svg>
  );
}
