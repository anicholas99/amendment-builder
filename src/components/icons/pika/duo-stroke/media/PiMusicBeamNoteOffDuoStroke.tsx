import React from 'react';

/**
 * PiMusicBeamNoteOffDuoStroke icon from the duo-stroke style in media category.
 */
interface PiMusicBeamNoteOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicBeamNoteOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'music-beam-note-off icon',
  ...props
}: PiMusicBeamNoteOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12.077V8.03c0-.805.503-1.527 1.269-1.821l10.683-4.106a1.52 1.52 0 0 1 1.748.484M8 12.077l6.588-2.532M8 12.077v3.913m14 0c0 1.62-1.343 2.935-3 2.935s-3-1.314-3-2.935 1.343-2.935 3-2.935 3 1.314 3 2.935Zm0 0V7.825M7.121 16.85A3.02 3.02 0 0 0 5 15.99c-1.657 0-3 1.314-3 2.935 0 .81.336 1.544.879 2.075" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
