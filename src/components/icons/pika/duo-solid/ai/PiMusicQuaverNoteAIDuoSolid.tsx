import React from 'react';

/**
 * PiMusicQuaverNoteAIDuoSolid icon from the duo-solid style in ai category.
 */
interface PiMusicQuaverNoteAIDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicQuaverNoteAIDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'music-quaver-note-ai icon',
  ...props
}: PiMusicQuaverNoteAIDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 21 8.046 7.07 7.07 0 0 1 19.819 12" opacity=".28"/><path fill={color || "currentColor"} d="M7 3a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 7 3Z"/><path fill={color || "currentColor"} d="M2 11a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M12 14.997a4 4 0 0 0-4 4.001 4 4 0 1 0 4-4.001Z"/>
    </svg>
  );
}
