import React from 'react';

/**
 * PiWalletRefreshContrast icon from the contrast style in web3-&-crypto category.
 */
interface PiWalletRefreshContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWalletRefreshContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'wallet-refresh icon',
  ...props
}: PiWalletRefreshContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.38 10.087C2 11.005 2 12.17 2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706c.876.364 1.977.38 4.1.381a13 13 0 0 1 .754-2.82c.34-.87 1-1.535 1.805-1.897a3 3 0 0 1 .993-3.094 7 7 0 0 1 2.342-1.269 6.99 6.99 0 0 1 6.042.888 3 3 0 0 1 .864-.223c-.026-1.138-.11-1.875-.368-2.498a5 5 0 0 0-2.706-2.706A4 4 0 0 0 18 7.13C17.195 7 16.134 7 14.5 7h-5c-2.33 0-3.495 0-4.413.38a5 5 0 0 0-2.706 2.707Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706c.727.302 1.608.364 3.1.378M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131m0 0c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.174.42.269.89.32 1.5m.356 3.983a10 10 0 0 1-.672 2.363.47.47 0 0 1-.455.286m-2.403-.768c.745.349 1.53.604 2.336.76l.067.008m-5.565 1.463a10 10 0 0 0-2.4-.704m-1.079 2.677c.105-.816.31-1.615.61-2.38a.47.47 0 0 1 .469-.297m7.965-.759a4 4 0 0 0-6.524-2.714m-1.441 3.473q.04.412.167.82a4 4 0 0 0 6.366 1.88" fill="none"/>
    </svg>
  );
}
