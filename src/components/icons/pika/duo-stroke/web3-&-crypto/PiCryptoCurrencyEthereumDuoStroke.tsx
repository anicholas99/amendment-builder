import React from 'react';

/**
 * PiCryptoCurrencyEthereumDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiCryptoCurrencyEthereumDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCryptoCurrencyEthereumDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crypto-currency-ethereum icon',
  ...props
}: PiCryptoCurrencyEthereumDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.842 20.725c-.636.707-.953 1.06-1.33 1.19a1.57 1.57 0 0 1-1.022 0c-.376-.13-.694-.483-1.33-1.19l-3.467-4.192c-.546-.606-.819-.91-.808-1.11a.5.5 0 0 1 .268-.411c.182-.095.58.015 1.378.237l3.356.932c.417.116.625.174.837.197q.283.03.566 0c.212-.023.42-.08.837-.197l3.356-.932c.797-.222 1.196-.332 1.378-.237a.5.5 0 0 1 .268.41c.01.201-.262.505-.808 1.111z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.09 3.428c.653-.793.98-1.19 1.374-1.334a1.57 1.57 0 0 1 1.072 0c.395.144.721.54 1.374 1.334l3.862 4.692c.792.963 1.189 1.444 1.224 1.903.03.4-.107.796-.381 1.097-.314.344-.93.494-2.16.793l-3.466.842c-.369.09-.553.135-.74.153a2.6 2.6 0 0 1-.498 0c-.187-.018-.371-.063-.74-.152l-3.466-.843c-1.23-.3-1.846-.449-2.16-.793a1.46 1.46 0 0 1-.38-1.097c.035-.459.43-.94 1.223-1.903z" fill="none"/>
    </svg>
  );
}
