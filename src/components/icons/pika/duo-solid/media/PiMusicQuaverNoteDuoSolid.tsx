import React from 'react';

/**
 * PiMusicQuaverNoteDuoSolid icon from the duo-solid style in media category.
 */
interface PiMusicQuaverNoteDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMusicQuaverNoteDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'music-quaver-note icon',
  ...props
}: PiMusicQuaverNoteDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 18 8.046 7.07 7.07 0 0 1 16.819 12" opacity=".28"/><path fill={color || "currentColor"} d="M9 14.997a4 4 0 0 0-4 4.001 4 4 0 1 0 4-4.001Z"/>
    </svg>
  );
}
