import React from 'react';

/**
 * PiArchiveBoltDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiArchiveBoltDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveBoltDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-bolt icon',
  ...props
}: PiArchiveBoltDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18a1 1 0 0 1 .634.227l.073.066A1 1 0 0 1 22 4v1a1 1 0 0 1-1 1H3a1 1 0 0 1-.634-.227l-.073-.066A1 1 0 0 1 2 5V4l.005-.099a1 1 0 0 1 .222-.535l.066-.073a1 1 0 0 1 .608-.288z"/><path fill={color || "currentColor"} stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 10v7a4 4 0 0 1-1.035 2.685l-.137.143A4 4 0 0 1 16 21H8a4 4 0 0 1-4-4v-7z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 12-2.251 3.002a.5.5 0 0 0 .482.793l3.538-.59a.5.5 0 0 1 .482.793L12 19"/>
    </svg>
  );
}
