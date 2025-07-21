import React from 'react';

/**
 * PiCurrencySignEuroDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignEuroDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignEuroDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-euro icon',
  ...props
}: PiCurrencySignEuroDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h11M3 14h10" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 5.255A7 7 0 0 0 6 11v2a7 7 0 0 0 11 5.745" fill="none"/>
    </svg>
  );
}
