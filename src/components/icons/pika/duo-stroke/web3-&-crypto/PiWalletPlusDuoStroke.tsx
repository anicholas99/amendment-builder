import React from 'react';

/**
 * PiWalletPlusDuoStroke icon from the duo-stroke style in web3-&-crypto category.
 */
interface PiWalletPlusDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWalletPlusDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'wallet-plus icon',
  ...props
}: PiWalletPlusDuoStrokeProps): JSX.Element {
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
      <path fill="none" fillRule="evenodd" d="M1 14.392v.23c0 1.23-.001 2.569.457 3.674a6 6 0 0 0 3.247 3.247c.602.25 1.244.356 1.992.407.732.05 1.634.05 2.768.05h3.067a1 1 0 1 0 0-2h-3.03c-1.18 0-2.013 0-2.669-.045-.646-.044-1.045-.128-1.363-.26a4 4 0 0 1-2.164-2.164C3.016 16.835 3 15.896 3 14.5c0-1.178 0-2.012.045-2.668.044-.646.128-1.046.26-1.363a4 4 0 0 1 2.164-2.165c.318-.13.717-.215 1.363-.259C7.488 8.001 8.322 8 9.5 8h5c1.659 0 2.619.003 3.322.116l.032.005c.276.046.49.106.677.183a4 4 0 0 1 2.165 2.165c.224.543.291 1.263.302 2.885a1 1 0 1 0 2-.013c-.01-1.556-.056-2.674-.455-3.637a6 6 0 0 0-3.247-3.247q-.15-.062-.302-.113c-.017-.728-.075-1.336-.298-1.875a4 4 0 0 0-2.165-2.165c-.418-.173-.852-.241-1.321-.273C14.757 2 14.204 2 13.534 2H9.956c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.582 2.359C1 8.509 1 9.593 1 10.956zM13.5 4c.713 0 1.197 0 1.573.026.368.025.559.07.692.126a2 2 0 0 1 1.083 1.083c.07.169.11.382.132.797A53 53 0 0 0 14.6 6H9.465c-1.134 0-2.036 0-2.768.05-.748.05-1.39.158-1.992.407a6 6 0 0 0-1.603.983c.068-.567.177-.947.335-1.256a4 4 0 0 1 1.748-1.748c.37-.189.842-.308 1.614-.371C7.58 4 8.583 4 10 4z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 22v-3m0 0v-3m0 3h-3m3 0h3m-8-7h3" fill="none"/>
    </svg>
  );
}
