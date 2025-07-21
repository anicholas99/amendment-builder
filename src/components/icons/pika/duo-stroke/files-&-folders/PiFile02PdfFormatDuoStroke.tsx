import React from 'react';

/**
 * PiFile02PdfFormatDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02PdfFormatDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02PdfFormatDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-pdf-format icon',
  ...props
}: PiFile02PdfFormatDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 10a8 8 0 0 0-8-8H8a4 4 0 0 0-4 4v4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-5h1.5a2.5 2.5 0 0 1 0 5zm0 0v2m14-3v-4h4m-4 4v3m0-3h4m-1-8a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.025.713a2 2 0 0 0 1.662 1.662c.156.025.341.025.713.025h.6c1.306 0 2.418.835 2.83 2zm-10 4v7h.5a3.5 3.5 0 1 0 0-7z" fill="none"/>
    </svg>
  );
}
