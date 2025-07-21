import React from 'react';

/**
 * PiArchiveArrowUpDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiArchiveArrowUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveArrowUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-arrow-up icon',
  ...props
}: PiArchiveArrowUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.429 13.91c.634-.846 1.37-1.61 2.19-2.275A.6.6 0 0 1 12 11.5m0 0c.139 0 .273.047.381.135a13 13 0 0 1 2.19 2.275M12 11.5v6" fill="none"/>
    </svg>
  );
}
