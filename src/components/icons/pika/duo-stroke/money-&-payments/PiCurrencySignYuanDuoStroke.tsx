import React from 'react';

/**
 * PiCurrencySignYuanDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignYuanDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignYuanDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-yuan icon',
  ...props
}: PiCurrencySignYuanDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h12M6 16h12" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 3 7 8.1m0 0L19 3m-7 8.1V21" fill="none"/>
    </svg>
  );
}
