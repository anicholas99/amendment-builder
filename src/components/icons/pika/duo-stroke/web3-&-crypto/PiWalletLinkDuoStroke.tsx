import React from 'react';

/**
 * PiWalletLinkDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiWalletLinkDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWalletLinkDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'wallet-link icon',
  ...props
}: PiWalletLinkDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706c.707.293 1.56.36 2.978.376M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131m0 0c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.333.803.375 1.793.38 3.585" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.965 17h.037A3 3 0 0 1 22 20c0 1.657-1.342 3-2.998 3h-.037m-3.93-6h-.037A3 3 0 0 0 12 20c0 1.657 1.342 3 2.998 3h.037m.962-3h1.999M14 12h3" fill="none"/>
    </svg>
  );
}
