import React from 'react';

/**
 * PiTicketTokenContrast icon from the contrast style in general category.
 */
interface PiTicketTokenContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTicketTokenContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'ticket-token icon',
  ...props
}: PiTicketTokenContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M18 4H6a4 4 0 0 0-4 4v.4a.6.6 0 0 0 .6.6A2.4 2.4 0 0 1 5 11.4v1.2A2.4 2.4 0 0 1 2.6 15a.6.6 0 0 0-.6.6v.4a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-.4a.6.6 0 0 0-.6-.6 2.4 2.4 0 0 1-2.4-2.4v-1.2A2.4 2.4 0 0 1 21.4 9a.6.6 0 0 0 .6-.6V8a4 4 0 0 0-4-4Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6.102V4m0 5.401v1m0 3.3v1M10 18v2m0-16H6a4 4 0 0 0-4 4v.4a.6.6 0 0 0 .6.6A2.4 2.4 0 0 1 5 11.4v1.2A2.4 2.4 0 0 1 2.6 15a.6.6 0 0 0-.6.6v.4a4 4 0 0 0 4 4h4m0-16h8a4 4 0 0 1 4 4v.4a.6.6 0 0 1-.6.6 2.4 2.4 0 0 0-2.4 2.4v1.2a2.4 2.4 0 0 0 2.4 2.4.6.6 0 0 1 .6.6v.4a4 4 0 0 1-4 4h-8" fill="none"/>
    </svg>
  );
}
