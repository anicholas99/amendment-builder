import React from 'react';

/**
 * PiArrowBigTurnRightContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowBigTurnRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigTurnRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-turn-right icon',
  ...props
}: PiArrowBigTurnRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20.76 11.307A35.3 35.3 0 0 0 14.201 5q.231 1.995.33 4C6.997 9 2.997 12 2.997 19c3-4 7-4 11.535-4a61 61 0 0 1-.33 4 35.3 35.3 0 0 0 6.557-6.307 1.11 1.11 0 0 0 0-1.386Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.759 11.307A35.3 35.3 0 0 0 14.2 5q.232 1.995.33 4C6.998 9 2.998 12 2.998 19c3-4 7-4 11.535-4a61 61 0 0 1-.33 4 35.3 35.3 0 0 0 6.557-6.307 1.11 1.11 0 0 0 0-1.386Z" fill="none"/>
    </svg>
  );
}
