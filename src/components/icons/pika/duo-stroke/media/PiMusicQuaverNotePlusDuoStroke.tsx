import React from 'react';

/**
 * PiMusicQuaverNotePlusDuoStroke icon from the duo-stroke style in media category.
 */
interface PiMusicQuaverNotePlusDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicQuaverNotePlusDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'music-quaver-note-plus icon',
  ...props
}: PiMusicQuaverNotePlusDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 20 8.046 7.07 7.07 0 0 1 18.819 12" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7m0 0V4m0 3H4m3 0h3" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 18.998a3 3 0 1 1 6.002-.001A3 3 0 0 1 8 18.998Z" fill="none"/>
    </svg>
  );
}
