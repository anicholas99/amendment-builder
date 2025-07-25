import React from 'react';

/**
 * PiFileJpgFormatContrast icon from the contrast style in files-&-folders category.
 */
interface PiFileJpgFormatContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileJpgFormatContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'file-jpg-format icon',
  ...props
}: PiFileJpgFormatContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20 11V9.651c0-.787 0-1.257-.058-1.651a3 3 0 0 0-.052-.277 4 4 0 0 0-.48-1.156c-.247-.404-.593-.75-1.285-1.442l-1.25-1.25c-.692-.692-1.038-1.038-1.442-1.286a4 4 0 0 0-1.156-.478A3 3 0 0 0 14 2.058C13.607 2 13.136 2 12.349 2H10.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4V11z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.25 15c-.451-.619-1.069-1-1.75-1-1.38 0-2.5 1.567-2.5 3.5s1.12 3.5 2.5 3.5c.681 0 1.299-.381 1.75-1v-2h-.75M10 19v-5h1.5a2.5 2.5 0 0 1 0 5zm0 0v2m-7-2.333V19a2 2 0 1 0 4 0v-5H4M14 2.058V3.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C16.28 8 17.12 8 18.8 8h1.142M14 2.058C13.607 2 13.136 2 12.349 2H10.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4V10m10-7.942q.143.02.277.053c.408.098.798.26 1.156.478.404.248.75.594 1.442 1.286l1.25 1.25c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156q.031.134.052.277m0 0c.058.394.058.864.058 1.651V10" fill="none"/>
    </svg>
  );
}
