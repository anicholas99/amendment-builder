import React from 'react';

/**
 * PiCurrencySignDollarDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignDollarDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignDollarDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-dollar icon',
  ...props
}: PiCurrencySignDollarDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7.5c-.37-1.553-1.675-2.7-3.228-2.7h-3.439C8.493 4.8 7 6.412 7 8.4S8.492 12 10.333 12h3.334C15.507 12 17 13.612 17 15.6s-1.492 3.6-3.333 3.6h-3.439C8.675 19.2 7.37 18.053 7 16.5" fill="none"/>
    </svg>
  );
}
