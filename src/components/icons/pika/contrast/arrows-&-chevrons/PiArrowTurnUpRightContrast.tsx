import React from 'react';

/**
 * PiArrowTurnUpRightContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowTurnUpRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnUpRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-up-right icon',
  ...props
}: PiArrowTurnUpRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M15.141 4a25.2 25.2 0 0 1 4.684 4.505.79.79 0 0 1 0 .99A25.2 25.2 0 0 1 15.141 14c.16-.935.241-1.402.303-1.87a24 24 0 0 0 0-6.26A50 50 0 0 0 15.141 4Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.649 9H12c-2.8 0-4.2 0-5.27.545a5 5 0 0 0-2.185 2.185C4 12.8 4 14.2 4 17v3M15.649 9q0-1.57-.205-3.13A50 50 0 0 0 15.141 4a25.2 25.2 0 0 1 4.684 4.505.79.79 0 0 1 0 .99A25.2 25.2 0 0 1 15.141 14c.16-.935.241-1.402.303-1.87q.204-1.56.205-3.13Z" fill="none"/>
    </svg>
  );
}
