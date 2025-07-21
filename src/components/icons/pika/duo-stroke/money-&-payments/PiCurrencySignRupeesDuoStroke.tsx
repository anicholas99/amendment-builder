import React from 'react';

/**
 * PiCurrencySignRupeesDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignRupeesDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignRupeesDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-rupees icon',
  ...props
}: PiCurrencySignRupeesDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 9h14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4h6.02m0 0H19m-7.98 0a5 5 0 1 1 0 10H5.5l9.5 7" fill="none"/>
    </svg>
  );
}
