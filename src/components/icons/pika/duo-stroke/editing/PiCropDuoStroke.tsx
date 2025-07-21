import React from 'react';

/**
 * PiCropDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiCropDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCropDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crop icon',
  ...props
}: PiCropDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 18h4v4M18 2v4h4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.092 6.218C7.52 6 8.08 6 9.2 6H18v8.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C16.48 18 15.92 18 14.8 18H6V9.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874Z" fill="none"/>
    </svg>
  );
}
