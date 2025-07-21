import React from 'react';

/**
 * PiCreditCardRemoveDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiCreditCardRemoveDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCreditCardRemoveDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'credit-card-remove icon',
  ...props
}: PiCreditCardRemoveDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 9h-.006m0 0c.006.413.006.876.006 1.4V15m-.006-6c-.018-1.35-.096-2.16-.43-2.816a4 4 0 0 0-1.748-1.748C18.96 4 17.84 4 15.6 4H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748c-.334.655-.412 1.466-.43 2.816m0 0H2m.006 0C2 9.413 2 9.876 2 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 20 6.16 20 8.4 20h3.768" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.995 9H2.005M9 13H6m10 6h6" fill="none"/>
    </svg>
  );
}
