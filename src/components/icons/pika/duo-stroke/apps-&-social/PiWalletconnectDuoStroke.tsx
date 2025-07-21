import React from 'react';

/**
 * PiWalletconnectDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiWalletconnectDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWalletconnectDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'walletconnect icon',
  ...props
}: PiWalletconnectDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.769 8.846A8.23 8.23 0 0 1 11.999 6a8.23 8.23 0 0 1 6.232 2.846" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 12.111 5 5.625 5-5.625 5 5.625 5-5.625" fill="none"/>
    </svg>
  );
}
