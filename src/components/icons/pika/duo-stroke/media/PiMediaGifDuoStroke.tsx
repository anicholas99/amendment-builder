import React from 'react';

/**
 * PiMediaGifDuoStroke icon from the duo-stroke style in media category.
 */
interface PiMediaGifDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMediaGifDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'media-gif icon',
  ...props
}: PiMediaGifDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 4 7.16 4 9.4 4h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 7.04 21 8.16 21 10.4v3.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 20 16.84 20 14.6 20H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 16.96 3 15.84 3 13.6z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 8.75H8a2 2 0 0 0-2 2v2.5a2 2 0 0 0 2 2h1.5V12h-.713m4.06-3.25v6.5m5.195-6.5h-1a1 1 0 0 0-1 1v2.256m0 0v3.244m0-3.244h2" fill="none"/>
    </svg>
  );
}
