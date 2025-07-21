import React from 'react';

/**
 * PiTrezorWalletDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiTrezorWalletDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrezorWalletDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'trezor-wallet icon',
  ...props
}: PiTrezorWalletDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7.5 8A2.5 2.5 0 0 0 5 10.5v6.6a2.5 2.5 0 0 0 1.323 2.206l4.5 2.402a2.5 2.5 0 0 0 2.354 0l4.5-2.402A2.5 2.5 0 0 0 19 17.1v-6.6A2.5 2.5 0 0 0 16.5 8z" opacity=".28"/><path fill={color || "currentColor"} d="M9 7a3 3 0 1 1 6 0v1h1.5q.257 0 .5.05V7A5 5 0 0 0 7 7v1.05Q7.243 8 7.5 8H9z"/>
    </svg>
  );
}
