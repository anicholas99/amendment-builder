import React from 'react';

/**
 * PiLogOutLeftContrast icon from the contrast style in general category.
 */
interface PiLogOutLeftContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLogOutLeftContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'log-out-left icon',
  ...props
}: PiLogOutLeftContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M3.157 11.556A15 15 0 0 1 5.812 9c-.1.994-.262 2-.262 3s.162 2.006.262 3a15 15 0 0 1-2.655-2.556.7.7 0 0 1 0-.888Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4.528A6 6 0 0 1 21 9v6a6 6 0 0 1-10 4.472" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.55 12H16M5.55 12c0-1 .162-2.006.262-3a15 15 0 0 0-2.655 2.556.7.7 0 0 0 0 .888A15 15 0 0 0 5.812 15c-.1-.994-.262-2-.262-3Z" fill="none"/>
    </svg>
  );
}
