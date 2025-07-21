import React from 'react';

/**
 * PiMusicBeamNoteDuoStroke icon from the duo-stroke style in media category.
 */
interface PiMusicBeamNoteDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicBeamNoteDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'music-beam-note icon',
  ...props
}: PiMusicBeamNoteDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12V7.863a2 2 0 0 1 1.269-1.861l10.683-4.197A1.5 1.5 0 0 1 22 3.2v3.3M8 12v7m0-7 14-5.5m0 0V16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 19a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" fill="none"/>
    </svg>
  );
}
