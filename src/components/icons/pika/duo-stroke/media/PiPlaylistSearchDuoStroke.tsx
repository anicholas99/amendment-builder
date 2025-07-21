import React from 'react';

/**
 * PiPlaylistSearchDuoStroke icon from the duo-stroke style in media category.
 */
interface PiPlaylistSearchDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaylistSearchDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'playlist-search icon',
  ...props
}: PiPlaylistSearchDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.092C4.9 10 5.6 10 7 10h10c1.4 0 2.1 0 2.635.273a2.5 2.5 0 0 1 1.092 1.092C21 11.9 21 12.6 21 14v4c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092C19.1 22 18.4 22 17 22H7c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C3 20.1 3 19.4 3 18z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 6h14M7 2.001 17 2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15.107 19.213-1.668-1.668m0 0a2.663 2.663 0 1 0-3.767-3.766 2.663 2.663 0 0 0 3.767 3.767Z" fill="none"/>
    </svg>
  );
}
