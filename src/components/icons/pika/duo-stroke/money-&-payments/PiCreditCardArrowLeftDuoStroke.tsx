import React from 'react';

/**
 * PiCreditCardArrowLeftDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCreditCardArrowLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCreditCardArrowLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'credit-card-arrow-left icon',
  ...props
}: PiCreditCardArrowLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20H8.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C2 16.96 2 15.84 2 13.6v-3.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C5.04 4 6.16 4 8.4 4h7.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C22 7.04 22 8.16 22 10.4v3.2c0 .814 0 1.48-.02 2.039" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.41 22.573a13 13 0 0 1-2.275-2.191.6.6 0 0 1-.135-.38m2.41-2.572c-.846.634-1.61 1.37-2.275 2.191a.6.6 0 0 0-.135.38m0 0h6M2 9h20M6 13h3" fill="none"/>
    </svg>
  );
}
