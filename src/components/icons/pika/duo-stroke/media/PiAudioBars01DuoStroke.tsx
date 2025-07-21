import React from 'react';

/**
 * PiAudioBars01DuoStroke icon from the duo-stroke style in media category.
 */
interface PiAudioBars01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAudioBars01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'audio-bars-01 icon',
  ...props
}: PiAudioBars01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v4m18-4v4M12 3v18" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 7v10m9-10v10" opacity=".28" fill="none"/>
    </svg>
  );
}
