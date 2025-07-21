import React from 'react';

/**
 * PiFilePdfFormatDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFilePdfFormatDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFilePdfFormatDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-pdf-format icon',
  ...props
}: PiFilePdfFormatDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h1.949c.978 0 1.468 0 1.928.11.408.099.798.26 1.156.48.404.247.75.593 1.442 1.285l1.25 1.25c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156c.11.46.11.95.11 1.928V10" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-5h1.5a2.5 2.5 0 0 1 0 5zm0 0v2m14-3v-4h4m-4 4v3m0-3h4m-11-4v7h.5a3.5 3.5 0 1 0 0-7zm8.125-8.874-1.25-1.251c-.692-.692-1.038-1.038-1.442-1.285a4 4 0 0 0-1.156-.48A3 3 0 0 0 14 2.059V3.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C16.28 8 17.12 8 18.8 8h1.142a3 3 0 0 0-.052-.277 4 4 0 0 0-.48-1.156c-.247-.404-.593-.75-1.285-1.441Z" fill="none"/>
    </svg>
  );
}
