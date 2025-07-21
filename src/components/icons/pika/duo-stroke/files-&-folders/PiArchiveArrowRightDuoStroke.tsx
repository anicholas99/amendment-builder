import React from 'react';

/**
 * PiArchiveArrowRightDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiArchiveArrowRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveArrowRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-arrow-right icon',
  ...props
}: PiArchiveArrowRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.59 17.07a12.8 12.8 0 0 0 2.275-2.19.6.6 0 0 0 .135-.38m0 0a.6.6 0 0 0-.135-.381 13 13 0 0 0-2.275-2.19m2.41 2.57H9" fill="none"/>
    </svg>
  );
}
