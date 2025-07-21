import React from 'react';

/**
 * PiArrowTurnRightUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowTurnRightUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnRightUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-right-up icon',
  ...props
}: PiArrowTurnRightUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 4v8c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C11.2 20 9.8 20 7 20H4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8.859a25.2 25.2 0 0 0-4.505-4.684.79.79 0 0 0-.99 0A25.2 25.2 0 0 0 10 8.859" fill="none"/>
    </svg>
  );
}
