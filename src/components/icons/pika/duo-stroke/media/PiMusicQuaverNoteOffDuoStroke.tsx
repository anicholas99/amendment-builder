import React from 'react';

/**
 * PiMusicQuaverNoteOffDuoStroke icon from the duo-stroke style in media category.
 */
interface PiMusicQuaverNoteOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicQuaverNoteOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'music-quaver-note-off icon',
  ...props
}: PiMusicQuaverNoteOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18.998a3 3 0 0 1-4.127 2.783M12 18.998c0-.398-.078-.778-.219-1.126M12 18.998v-1.344M12 12V3.643a1.64 1.64 0 0 1 2.373-1.468A6.56 6.56 0 0 1 17.75 6.25M7.715 16.285a3 3 0 0 0-1.426 1.426" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
