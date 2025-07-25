import React from 'react';

/**
 * PiMedicinePillTabletsContrast icon from the contrast style in medical category.
 */
interface PiMedicinePillTabletsContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillTabletsContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pill-tablets icon',
  ...props
}: PiMedicinePillTabletsContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M8.056 11.889a5 5 0 1 1-2.11-9.776 5 5 0 0 1 2.11 9.776Z" fill="none" stroke="currentColor"/><path d="M15.283 21.697a5 5 0 1 1 3.437-9.391 5 5 0 0 1-3.437 9.39Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12.306 15.283 9.39 3.437m-9.39-3.437a5 5 0 0 0 9.39 3.437m-9.39-3.437a5 5 0 0 1 9.39 3.437M2.115 8.056l9.775-2.11m-9.775 2.11a5 5 0 0 0 9.775-2.11m-9.775 2.11a5 5 0 0 1 9.775-2.11" fill="none"/>
    </svg>
  );
}
