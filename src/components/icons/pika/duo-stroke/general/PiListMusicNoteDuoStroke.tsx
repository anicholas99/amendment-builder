import React from 'react';

/**
 * PiListMusicNoteDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListMusicNoteDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListMusicNoteDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-music-note icon',
  ...props
}: PiListMusicNoteDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h6m-6 6h6M4 6h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17.5a1.5 1.5 0 1 1-3 .002 1.5 1.5 0 0 1 3-.001Zm0 0v-6.678a.82.82 0 0 1 1.187-.734A3.28 3.28 0 0 1 20 13.023a3.6 3.6 0 0 1-.312 1.477" fill="none"/>
    </svg>
  );
}
