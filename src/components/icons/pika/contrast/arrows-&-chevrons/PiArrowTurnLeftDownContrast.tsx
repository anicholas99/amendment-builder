import React from 'react';

/**
 * PiArrowTurnLeftDownContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowTurnLeftDownContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnLeftDownContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-left-down icon',
  ...props
}: PiArrowTurnLeftDownContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4 15.142a25.2 25.2 0 0 0 4.505 4.684.79.79 0 0 0 .99 0A25.2 25.2 0 0 0 14 15.142c-.935.16-1.402.24-1.87.302a24 24 0 0 1-6.26 0A50 50 0 0 1 4 15.142Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15.649V12c0-2.8 0-4.2.545-5.27a5 5 0 0 1 2.185-2.185C12.8 4 14.2 4 17 4h3M9 15.649q-1.57 0-3.13-.205A50 50 0 0 1 4 15.141a25.2 25.2 0 0 0 4.505 4.684.79.79 0 0 0 .99 0A25.2 25.2 0 0 0 14 15.141c-.935.16-1.402.241-1.87.303a24 24 0 0 1-3.13.205Z" fill="none"/>
    </svg>
  );
}
