import React from 'react';

/**
 * PiCrownWinnerKingDuoStroke icon from the duo-stroke style in general category.
 */
interface PiCrownWinnerKingDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCrownWinnerKingDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'crown-winner-king icon',
  ...props
}: PiCrownWinnerKingDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.23 21.5a20.6 20.6 0 0 0-14.46 0" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1.573 6.94c-.142-.616.611-1.034 1.058-.587 2.555 2.556 6.89 1.666 8.233-1.69l.765-1.912a.4.4 0 0 1 .742 0l.765 1.912c1.342 3.356 5.677 4.246 8.232 1.69.447-.447 1.2-.03 1.058.587l-2.484 10.767a22.62 22.62 0 0 0-15.884 0z" fill="none"/>
    </svg>
  );
}
