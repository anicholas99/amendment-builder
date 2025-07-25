import React from 'react';

/**
 * PiResolutionQualityHdDuoStroke icon from the duo-stroke style in media category.
 */
interface PiResolutionQualityHdDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiResolutionQualityHdDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'resolution-quality-hd icon',
  ...props
}: PiResolutionQualityHdDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.6 4H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 7.04 3 8.16 3 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 20 7.16 20 9.4 20h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 16.96 21 15.84 21 13.6v-3.2c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 4 16.84 4 14.6 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.754 8.75v3.5m0 0h3.5m-3.5 0v3m3.5-3v-3.5m0 3.5v3m3.5-6.5h.3c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874c.218.428.218.988.218 2.108v.1c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.428.218-.988.218-2.108.218h-.3z" fill="none"/>
    </svg>
  );
}
