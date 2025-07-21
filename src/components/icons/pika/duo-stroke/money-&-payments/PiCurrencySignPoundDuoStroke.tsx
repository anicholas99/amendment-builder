import React from 'react';

/**
 * PiCurrencySignPoundDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCurrencySignPoundDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCurrencySignPoundDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'currency-sign-pound icon',
  ...props
}: PiCurrencySignPoundDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.024 12.889H16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 20H6.25c-.263 0-.347-.38-.112-.505a4.55 4.55 0 0 0 2.38-4.02V8c0-2.272 1.773-4 3.851-4C14.328 4 16 5.62 16 7.765" fill="none"/>
    </svg>
  );
}
