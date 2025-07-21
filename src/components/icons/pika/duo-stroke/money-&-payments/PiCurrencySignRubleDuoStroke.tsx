import React from 'react';

/**
 * PiCurrencySignRubleDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignRubleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignRubleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-ruble icon',
  ...props
}: PiCurrencySignRubleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16h10" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h6a4 4 0 0 0 0-8h-3.143c-.798 0-1.197 0-1.518.112A2 2 0 0 0 8.112 5.34C8 5.66 8 6.06 8 6.857zm0 0H5m3 0v9" fill="none"/>
    </svg>
  );
}
