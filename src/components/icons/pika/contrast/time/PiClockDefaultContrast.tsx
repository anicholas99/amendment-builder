import React from 'react';

/**
 * PiClockDefaultContrast icon from the contrast style in time category.
 */
interface PiClockDefaultContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClockDefaultContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'clock-default icon',
  ...props
}: PiClockDefaultContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4.817a.5.5 0 0 0 .231.421L15 15m6.15-3a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z" fill="none"/>
    </svg>
  );
}
