import React from 'react';

/**
 * PiWalletCancelContrast icon from the contrast style in web3-&-crypto category.
 */
interface PiWalletCancelContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWalletCancelContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'wallet-cancel icon',
  ...props
}: PiWalletCancelContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.38 10.087C2 11.005 2 12.17 2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h4.7c0-.768.293-1.535.879-2.121l.279-.279-.28-.279a3 3 0 1 1 4.244-4.242l.278.279.279-.28a3 3 0 0 1 2.118-.878c-.013-1.5-.075-2.384-.378-3.113a5 5 0 0 0-2.706-2.706A4 4 0 0 0 18 7.13C17.195 7 16.134 7 14.5 7h-5c-2.33 0-3.495 0-4.413.38a5 5 0 0 0-2.706 2.707Z" opacity=".3" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h3.7M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131m0 0c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.229.551.32 1.192.357 2.12M14 12h3m.2 9 2.4-2.4m0 0 2.4-2.4m-2.4 2.4-2.4-2.4m2.4 2.4L22 21" fill="none"/>
    </svg>
  );
}
