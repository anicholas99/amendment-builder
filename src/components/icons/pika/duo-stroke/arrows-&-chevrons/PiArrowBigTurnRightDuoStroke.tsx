import React from 'react';

/**
 * PiArrowBigTurnRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowBigTurnRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigTurnRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-turn-right icon',
  ...props
}: PiArrowBigTurnRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.201 5q.232 1.995.33 4C6.998 9 2.998 11 2.998 19c3-4 7-4 11.535-4a61 61 0 0 1-.33 4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.201 5a35.3 35.3 0 0 1 6.558 6.307 1.11 1.11 0 0 1 0 1.386A35.3 35.3 0 0 1 14.2 19" fill="none"/>
    </svg>
  );
}
