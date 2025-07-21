import React from 'react';

/**
 * PiArrowTurnDownRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowTurnDownRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnDownRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-down-right icon',
  ...props
}: PiArrowTurnDownRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 15h-8c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C4 11.2 4 9.8 4 7V4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.141 20a25.2 25.2 0 0 0 4.684-4.505.79.79 0 0 0 0-.99A25.2 25.2 0 0 0 15.141 10" fill="none"/>
    </svg>
  );
}
