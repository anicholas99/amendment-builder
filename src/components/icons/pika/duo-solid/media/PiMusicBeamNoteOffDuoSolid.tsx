import React from 'react';

/**
 * PiMusicBeamNoteOffDuoSolid icon from the duo-solid style in media category.
 */
interface PiMusicBeamNoteOffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicBeamNoteOffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'music-beam-note-off icon',
  ...props
}: PiMusicBeamNoteOffDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M14.954 10.454 9 12.746V16a.99.99 0 0 1-.885.974.97.97 0 0 1-.287.58l-4.242 4.16a1.01 1.01 0 0 1-1.414 0A3.87 3.87 0 0 1 1 18.94c0-2.165 1.79-3.92 4-3.92.728 0 1.412.19 2 .524V8.023c0-1.21.755-2.295 1.903-2.737l10.683-4.114a2.53 2.53 0 0 1 2.912.807.967.967 0 0 1-.09 1.284l-7.113 6.971q-.147.144-.341.22Z"/><path fill={color || "currentColor"} d="M23 7.818a.99.99 0 0 0-1-.98.99.99 0 0 0-1 .98v4.785a4.04 4.04 0 0 0-2-.525c-2.21 0-4 1.756-4 3.921s1.79 3.922 4 3.922 4-1.756 4-3.922z"/></g><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22"/>
    </svg>
  );
}
