import React from 'react';

/**
 * PiArrowBigTurnLeftDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowBigTurnLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigTurnLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-turn-left icon',
  ...props
}: PiArrowBigTurnLeftDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} fillRule="evenodd" d="M9.468 8c3.801 0 6.982.492 9.204 2.209 2.291 1.768 3.331 4.64 3.331 8.791a1 1 0 0 1-1.8.6C17.54 16.05 14.068 16 9.468 16a1 1 0 0 1-.999-.95q-.15-3.05 0-6.1a1 1 0 0 1 1-.95Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M9.203 4.196a1 1 0 0 1 1.59.92 59.8 59.8 0 0 0 0 13.769 1 1 0 0 1-1.589.919 36.3 36.3 0 0 1-6.744-6.485 2.11 2.11 0 0 1 0-2.638 36.3 36.3 0 0 1 6.744-6.485z" clipRule="evenodd"/>
    </svg>
  );
}
