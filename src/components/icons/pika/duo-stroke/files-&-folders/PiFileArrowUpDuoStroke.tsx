import React from 'react';

/**
 * PiFileArrowUpDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFileArrowUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileArrowUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-arrow-up icon',
  ...props
}: PiFileArrowUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.6 22h-3.2c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 18.96 4 17.84 4 15.6V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h1.949c.978 0 1.468 0 1.928.11.408.099.798.26 1.156.48.404.247.75.593 1.442 1.285l1.25 1.25c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156c.11.46.11.95.11 1.928V15.6c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C16.96 22 15.84 22 13.6 22Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17v-6m0 0a.47.47 0 0 0-.296.105A10 10 0 0 0 10 12.875M12 11c.105 0 .21.035.296.105A10 10 0 0 1 14 12.875m4.125-7.75-1.25-1.25c-.692-.692-1.038-1.038-1.442-1.285a4 4 0 0 0-1.156-.48A3 3 0 0 0 14 2.059V3.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C16.28 8 17.12 8 18.8 8h1.142a3 3 0 0 0-.052-.277 4 4 0 0 0-.48-1.156c-.247-.404-.593-.75-1.285-1.441Z" fill="none"/>
    </svg>
  );
}
