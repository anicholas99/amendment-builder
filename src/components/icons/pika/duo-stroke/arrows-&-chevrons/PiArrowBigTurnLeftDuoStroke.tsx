import React from 'react';

/**
 * PiArrowBigTurnLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowBigTurnLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigTurnLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-turn-left icon',
  ...props
}: PiArrowBigTurnLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.799 5a61 61 0 0 0-.33 4c7.534 0 11.534 2 11.534 10-3-4-7-4-11.535-4q.1 2.005.33 4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.799 5a35.3 35.3 0 0 0-6.558 6.307 1.11 1.11 0 0 0 0 1.386A35.3 35.3 0 0 0 9.8 19" fill="none"/>
    </svg>
  );
}
