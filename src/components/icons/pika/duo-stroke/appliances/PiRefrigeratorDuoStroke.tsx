import React from 'react';

/**
 * PiRefrigeratorDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiRefrigeratorDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRefrigeratorDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'refrigerator icon',
  ...props
}: PiRefrigeratorDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C17.48 2 16.92 2 15.8 2H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C5 3.52 5 4.08 5 5.2V10m14 0v8.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C17.48 22 16.92 22 15.8 22H8.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C5 20.48 5 19.92 5 18.8V10m14 0H5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5.5v1m0 7v2" fill="none"/>
    </svg>
  );
}
