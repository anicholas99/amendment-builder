import React from 'react';

/**
 * PiBarcodeScanDuoStroke icon from the duo-stroke style in security category.
 */
interface PiBarcodeScanDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBarcodeScanDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'barcode-scan icon',
  ...props
}: PiBarcodeScanDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.604c-.027 1.387-.124 2.245-.481 2.946a4.5 4.5 0 0 1-1.969 1.969c-.7.357-1.56.454-2.946.481M21 8.396c-.027-1.387-.124-2.245-.481-2.946a4.5 4.5 0 0 0-1.969-1.97c-.7-.357-1.56-.454-2.946-.481M8.396 3c-1.387.027-2.245.124-2.946.481A4.5 4.5 0 0 0 3.48 5.45c-.357.7-.454 1.56-.481 2.946m0 7.208c.027 1.387.124 2.245.481 2.946a4.5 4.5 0 0 0 1.97 1.97c.7.357 1.56.454 2.946.481" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 9v6m-4-2V9m-4 6V9" fill="none"/>
    </svg>
  );
}
