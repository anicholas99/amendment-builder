import React from 'react';

/**
 * PiCryptoCurrencyUsdtDiamondDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiCryptoCurrencyUsdtDiamondDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCryptoCurrencyUsdtDiamondDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crypto-currency-usdt-diamond icon',
  ...props
}: PiCryptoCurrencyUsdtDiamondDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.592 4H7.408c-.854 0-1.651.427-2.125 1.137L2.43 9.418a2.554 2.554 0 0 0 .31 3.213l7.445 7.529c1 1.01 2.632 1.01 3.632 0l7.446-7.53a2.554 2.554 0 0 0 .31-3.212l-2.855-4.28A2.55 2.55 0 0 0 16.592 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.425 8H12m0 0h3.575M12 8v3m0 3c2.761 0 5-.672 5-1.5S14.761 11 12 11m0 3c-2.761 0-5-.672-5-1.5S9.239 11 12 11m0 3v3m0-6v.5" fill="none"/>
    </svg>
  );
}
