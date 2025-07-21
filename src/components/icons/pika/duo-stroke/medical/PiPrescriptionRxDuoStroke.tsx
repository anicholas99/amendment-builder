import React from 'react';

/**
 * PiPrescriptionRxDuoStroke icon from the duo-stroke style in medical category.
 */
interface PiPrescriptionRxDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPrescriptionRxDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'prescription-rx icon',
  ...props
}: PiPrescriptionRxDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12.003 21 4-4m0 0 4-4m-4 4 4 4m-4-4-4-4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.003 9V3h6a3 3 0 1 1 0 6h-2m-4 0v6m0-6h4m0 0 4 4" fill="none"/>
    </svg>
  );
}
