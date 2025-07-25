import React from 'react';

/**
 * PiWalletArrowUpDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiWalletArrowUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWalletArrowUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'wallet-arrow-up icon',
  ...props
}: PiWalletArrowUpDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M18.994 6.344c-.017-.728-.075-1.336-.298-1.875a4 4 0 0 0-2.165-2.165c-.418-.173-.852-.241-1.321-.273C14.757 2 14.204 2 13.534 2H9.956c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.582 2.359C1 8.509 1 9.593 1 10.956v3.666c0 1.23-.001 2.569.457 3.674a6 6 0 0 0 3.247 3.247c.602.25 1.244.356 1.992.407.732.05 1.634.05 2.768.05h5.072c.982 0 1.79 0 2.464-.032v-.587a3 3 0 0 1-1.972-4.77 16 16 0 0 1 2.703-2.805 3.6 3.6 0 0 1 4.538 0q.375.304.731.63c0-1.121 0-2.014-.05-2.74-.05-.748-.157-1.39-.407-1.992a6 6 0 0 0-3.247-3.247q-.15-.062-.302-.113Zm-3.92-2.318c.367.025.558.07.691.126a2 2 0 0 1 1.083 1.083c.07.169.11.382.132.797A53 53 0 0 0 14.6 6H9.465c-1.134 0-2.036 0-2.768.05-.748.051-1.39.158-1.992.407a6 6 0 0 0-1.603.983c.068-.567.177-.947.335-1.256a4 4 0 0 1 1.748-1.748c.37-.189.842-.308 1.614-.371C7.58 4 8.583 4 10 4h3.5c.713 0 1.197 0 1.573.026Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 12h3m.428 6.412a13 13 0 0 1 2.192-2.275.6.6 0 0 1 .38-.135m2.571 2.41a13 13 0 0 0-2.19-2.275.6.6 0 0 0-.381-.135m0 0v6"/>
    </svg>
  );
}
