import React from 'react';

/**
 * PiBottleSoapContrast icon from the contrast style in medical category.
 */
interface PiBottleSoapContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBottleSoapContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'bottle-soap icon',
  ...props
}: PiBottleSoapContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M18 15.978c-6 1.608-6.248-3.541-12-1.486V20.5A1.5 1.5 0 0 0 7.5 22h9a1.5 1.5 0 0 0 1.5-1.5z" stroke="currentColor"/><path fill="currentColor" d="M15 7V6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1Z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 11a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v9.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 8V6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5V2" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 2h6.919c.944 0 1.782.604 2.081 1.5" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15.978c-6 1.608-6.248-3.541-12-1.486V20.5A1.5 1.5 0 0 0 7.5 22h9a1.5 1.5 0 0 0 1.5-1.5z" fill="none"/>
    </svg>
  );
}
