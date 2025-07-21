import React from 'react';

/**
 * PiMusicBeamNoteDuoSolid icon from the duo-solid style in media category.
 */
interface PiMusicBeamNoteDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicBeamNoteDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'music-beam-note icon',
  ...props
}: PiMusicBeamNoteDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M21 16V7.967L9 12.682V19a1 1 0 1 1-2 0V7.863a3 3 0 0 1 1.903-2.792L19.586.874A2.5 2.5 0 0 1 23 3.201V16a1 1 0 1 1-2 0Z" opacity=".28"/><path fill={color || "currentColor"} d="M19 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path fill={color || "currentColor"} d="M5 15a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
    </svg>
  );
}
