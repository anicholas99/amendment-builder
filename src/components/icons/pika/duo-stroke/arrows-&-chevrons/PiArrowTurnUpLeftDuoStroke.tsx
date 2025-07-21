import React from 'react';

/**
 * PiArrowTurnUpLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowTurnUpLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnUpLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-up-left icon',
  ...props
}: PiArrowTurnUpLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9h8c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C20 12.8 20 14.2 20 17v3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.859 4a25.2 25.2 0 0 0-4.684 4.505.79.79 0 0 0 0 .99A25.2 25.2 0 0 0 8.859 14" fill="none"/>
    </svg>
  );
}
