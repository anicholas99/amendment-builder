import React from 'react';

/**
 * PiCreditCardPlusContrast icon from the contrast style in money-&-payments category.
 */
interface PiCreditCardPlusContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCreditCardPlusContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'credit-card-plus icon',
  ...props
}: PiCreditCardPlusContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.038 8c.048-.784.156-1.341.398-1.816a4 4 0 0 1 1.748-1.748C5.04 4 6.16 4 8.4 4h7.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748c.242.475.35 1.032.398 1.816L22 10v4.013h-.752A3 3 0 0 0 13.17 20H8.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C2 16.96 2 15.84 2 13.6V10z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 9h-.006m0 0H2.006m19.988 0c.006.413.006.876.006 1.4v2.952M21.994 9c-.018-1.35-.096-2.16-.43-2.816a4 4 0 0 0-1.748-1.748C18.96 4 17.84 4 15.6 4H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748c-.334.655-.412 1.466-.43 2.816m0 0H2m.006 0C2 9.413 2 9.876 2 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 20 6.16 20 8.4 20h3.768M9 13H6" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 22v-3m0 0v-3m0 3h-3m3 0h3" fill="none"/>
    </svg>
  );
}
