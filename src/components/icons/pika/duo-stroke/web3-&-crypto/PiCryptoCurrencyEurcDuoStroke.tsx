import React from 'react';

/**
 * PiCryptoCurrencyEurcDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiCryptoCurrencyEurcDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCryptoCurrencyEurcDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crypto-currency-eurc icon',
  ...props
}: PiCryptoCurrencyEurcDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 20.457A9.15 9.15 0 0 1 2.85 12 9.15 9.15 0 0 1 8.5 3.543m7 0A9.15 9.15 0 0 1 21.15 12a9.15 9.15 0 0 1-5.65 8.456" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.916 7.784a4.36 4.36 0 0 0-2.5-.784c-2.28 0-4.115 1.773-4.362 4m6.862 5.216A4.377 4.377 0 0 1 8.261 14m0 0H7m1.262 0H11m-2.738 0c-.314-.949-.317-2.018-.208-3M7 11h1.054m0 0H12" fill="none"/>
    </svg>
  );
}
