import React from 'react';

/**
 * PiCurrencySignFrancDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignFrancDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignFrancDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-franc icon',
  ...props
}: PiCurrencySignFrancDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.5 12H5m0 4h7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 4h-5.643c-.798 0-1.197 0-1.518.112A2 2 0 0 0 8.112 5.34C8 5.66 8 6.06 8 6.857V21" fill="none"/>
    </svg>
  );
}
