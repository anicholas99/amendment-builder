import React from 'react';

/**
 * PiAudioBars02DuoStroke icon from the duo-stroke style in media category.
 */
interface PiAudioBars02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAudioBars02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'audio-bars-02 icon',
  ...props
}: PiAudioBars02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 10v3m8-10v18m8-16v13" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6v11m8-9v7m8-5v3" opacity=".28" fill="none"/>
    </svg>
  );
}
