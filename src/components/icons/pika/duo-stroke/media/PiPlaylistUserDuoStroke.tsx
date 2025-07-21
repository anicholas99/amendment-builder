import React from 'react';

/**
 * PiPlaylistUserDuoStroke icon from the duo-stroke style in media category.
 */
interface PiPlaylistUserDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaylistUserDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'playlist-user icon',
  ...props
}: PiPlaylistUserDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.092C4.9 10 5.6 10 7 10h10c1.4 0 2.1 0 2.635.273a2.5 2.5 0 0 1 1.092 1.092C21 11.9 21 12.6 21 14v4c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092C19.1 22 18.4 22 17 22H7c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C3 20.1 3 19.4 3 18z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 6h14M7 2.001 17 2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.25 17.118h-2.5c-.69 0-1.25.56-1.25 1.25 0 .345.28.625.625.625h3.75c.345 0 .625-.28.625-.625 0-.69-.56-1.25-1.25-1.25ZM13 13.69a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/>
    </svg>
  );
}
