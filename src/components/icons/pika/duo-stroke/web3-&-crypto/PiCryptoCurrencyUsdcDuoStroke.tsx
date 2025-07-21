import React from 'react';

/**
 * PiCryptoCurrencyUsdcDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiCryptoCurrencyUsdcDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCryptoCurrencyUsdcDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crypto-currency-usdc icon',
  ...props
}: PiCryptoCurrencyUsdcDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 20.457A9.15 9.15 0 0 1 2.85 12 9.15 9.15 0 0 1 8.5 3.543m7 0A9.15 9.15 0 0 1 21.15 12a9.15 9.15 0 0 1-5.65 8.457" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v1.2m0 0V12m0-4.8h-1.112c-1.227 0-2.222 1.075-2.222 2.4 0 1.326.995 2.4 2.222 2.4H12m0-4.8h1.181c1.036 0 1.906.765 2.153 1.8M12 12v4.8m0-4.8h1.111c1.228 0 2.223 1.075 2.223 2.4 0 1.326-.995 2.4-2.222 2.4H12m0 0V18m0-1.2h-1.18c-1.036 0-1.906-.765-2.153-1.8" fill="none"/>
    </svg>
  );
}
