import React from 'react';

/**
 * PiTrackpadDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiTrackpadDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrackpadDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'trackpad icon',
  ...props
}: PiTrackpadDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C5.04 3 6.16 3 8.4 3h7.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C22 6.04 22 7.16 22 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C18.96 21 17.84 21 15.6 21H8.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C2 17.96 2 16.84 2 14.6z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M4 13h8m8 0h-8m0 0v6" fill="none"/>
    </svg>
  );
}
