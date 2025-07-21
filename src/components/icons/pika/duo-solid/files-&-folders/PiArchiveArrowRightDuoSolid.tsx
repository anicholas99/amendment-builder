import React from 'react';

/**
 * PiArchiveArrowRightDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiArchiveArrowRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveArrowRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-arrow-right icon',
  ...props
}: PiArchiveArrowRightDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18a1 1 0 0 1 .634.227l.073.066A1 1 0 0 1 22 4v1a1 1 0 0 1-1 1H3a1 1 0 0 1-.634-.227l-.073-.066A1 1 0 0 1 2 5V4l.005-.099a1 1 0 0 1 .222-.535l.066-.073a1 1 0 0 1 .608-.288z"/><path fill={color || "currentColor"} stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 10v7a4 4 0 0 1-1.035 2.685l-.137.143A4 4 0 0 1 16 21H8a4 4 0 0 1-4-4v-7z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.59 18.07a12.8 12.8 0 0 0 2.275-2.19.6.6 0 0 0 .135-.38m0 0a.6.6 0 0 0-.135-.381 13 13 0 0 0-2.275-2.19m2.41 2.57H9"/>
    </svg>
  );
}
