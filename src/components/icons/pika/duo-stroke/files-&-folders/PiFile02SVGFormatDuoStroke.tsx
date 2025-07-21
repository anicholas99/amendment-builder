import React from 'react';

/**
 * PiFile02SVGFormatDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02SVGFormatDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02SVGFormatDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-svg-format icon',
  ...props
}: PiFile02SVGFormatDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 10a8 8 0 0 0-8-8H8a4 4 0 0 0-4 4v4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.25 15c-.451-.619-1.069-1-1.75-1-1.38 0-2.5 1.567-2.5 3.5s1.12 3.5 2.5 3.5c.681 0 1.299-.381 1.75-1v-2h-.75M7 14H4.75a1.75 1.75 0 1 0 0 3.5h1.5a1.75 1.75 0 1 1 0 3.5H3m7-7 1.55 7h1.552l1.55-7M20 10a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.025.713a2 2 0 0 0 1.662 1.662c.156.025.341.025.713.025h.6c1.306 0 2.418.835 2.83 2z" fill="none"/>
    </svg>
  );
}
