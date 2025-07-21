import React from 'react';

/**
 * PiFile02ArrowRightDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02ArrowRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02ArrowRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-arrow-right icon',
  ...props
}: PiFile02ArrowRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.126 12a10 10 0 0 1 1.77 1.704A.48.48 0 0 1 15 14m-1.874 2a10 10 0 0 0 1.77-1.704A.47.47 0 0 0 15 14m0 0H9m11-4a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.025.713a2 2 0 0 0 1.662 1.662c.156.025.341.025.713.025h.6a3 3 0 0 1 3 3z" fill="none"/>
    </svg>
  );
}
