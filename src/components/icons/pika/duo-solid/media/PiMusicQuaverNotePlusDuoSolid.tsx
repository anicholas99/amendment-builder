import React from 'react';

/**
 * PiMusicQuaverNotePlusDuoSolid icon from the duo-solid style in media category.
 */
interface PiMusicQuaverNotePlusDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicQuaverNotePlusDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'music-quaver-note-plus icon',
  ...props
}: PiMusicQuaverNotePlusDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 21 8.046 7.07 7.07 0 0 1 19.819 12" opacity=".28"/><path fill={color || "currentColor"} d="M7 3a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H8v2a1 1 0 1 1-2 0V8H4a1 1 0 0 1 0-2h2V4a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M8 18.998A4 4 0 1 1 12 23a4 4 0 0 1-4-4.002Z"/>
    </svg>
  );
}
