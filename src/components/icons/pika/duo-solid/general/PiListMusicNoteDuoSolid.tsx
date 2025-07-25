import React from 'react';

/**
 * PiListMusicNoteDuoSolid icon from the duo-solid style in general category.
 */
interface PiListMusicNoteDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListMusicNoteDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-music-note icon',
  ...props
}: PiListMusicNoteDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h6m-6 6h6M4 6h16" opacity=".28"/><path fill={color || "currentColor"} d="M19 13.024c0-.763-.38-1.468-1-1.889v6.366a2.5 2.5 0 1 1-2-2.45v-4.23a1.82 1.82 0 0 1 2.634-1.627A4.28 4.28 0 0 1 21 13.024c0 .65-.134 1.295-.4 1.887a1 1 0 0 1-1.824-.822c.146-.325.224-.688.224-1.065Z"/>
    </svg>
  );
}
