import React from 'react';

/**
 * PiMedicinePillTabletsDuoStroke icon from the duo-stroke style in medical category.
 */
interface PiMedicinePillTabletsDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillTabletsDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pill-tablets icon',
  ...props
}: PiMedicinePillTabletsDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M12.306 15.283a5 5 0 1 0 9.391 3.437 5 5 0 0 0-9.391-3.437Z" fill="none"/><path d="M2.114 8.056a5 5 0 1 0 9.775-2.11 5 5 0 0 0-9.775 2.11Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12.306 15.283 9.391 3.437M2.114 8.056l9.775-2.11" fill="none"/>
    </svg>
  );
}
