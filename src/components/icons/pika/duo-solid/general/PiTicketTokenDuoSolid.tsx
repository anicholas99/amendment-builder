import React from 'react';

/**
 * PiTicketTokenDuoSolid icon from the duo-solid style in general category.
 */
interface PiTicketTokenDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTicketTokenDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ticket-token icon',
  ...props
}: PiTicketTokenDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M6 3a5 5 0 0 0-5 5v.4A1.6 1.6 0 0 0 2.6 10 1.4 1.4 0 0 1 4 11.4v1.2A1.4 1.4 0 0 1 2.6 14 1.6 1.6 0 0 0 1 15.6v.4a5 5 0 0 0 5 5h12a5 5 0 0 0 5-5v-.4a1.6 1.6 0 0 0-1.6-1.6 1.4 1.4 0 0 1-1.4-1.4v-1.2a1.4 1.4 0 0 1 1.4-1.4A1.6 1.6 0 0 0 23 8.4V8a5 5 0 0 0-5-5z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 5v1.102m0 3.3v1m0 3.299v1M10 18v1"/>
    </svg>
  );
}
