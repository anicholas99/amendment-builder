import React from 'react';

/**
 * PiSupportMoneyDonationDuoSolid icon from the duo-solid style in general category.
 */
interface PiSupportMoneyDonationDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSupportMoneyDonationDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'support-money-donation icon',
  ...props
}: PiSupportMoneyDonationDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.423 14h4.472c1.363 0 3.467 1.687 1.95 2.997C17.5 21 10.5 21 6 16.914M15.423 14q.194.236.334.514A1.027 1.027 0 0 1 14.838 16H10m5.423-2a2.74 2.74 0 0 0-2.116-1h-1.122a.8.8 0 0 1-.35-.083 10.47 10.47 0 0 0-5.839-1.04Q6 11.937 6 12v4.914m0 0V17" opacity=".28"/><path fill={color || "currentColor"} d="M13.5 1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/><path fill={color || "currentColor"} d="M20.072 2.807a1 1 0 0 0-1.144 1.64 2.5 2.5 0 0 1-1.07 4.527 1 1 0 0 0 .284 1.98 4.5 4.5 0 0 0 1.93-8.147Z"/><path fill={color || "currentColor"} d="M4 9a3 3 0 0 0-3 3v5a3 3 0 1 0 6 0v-5a3 3 0 0 0-3-3Z"/>
    </svg>
  );
}
