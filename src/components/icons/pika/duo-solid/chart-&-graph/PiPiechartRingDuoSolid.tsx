import React from 'react';

/**
 * PiPiechartRingDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiPiechartRingDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechartRingDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-ring icon',
  ...props
}: PiPiechartRingDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M12 1.85c-4.845 0-8.895 3.394-9.907 7.932A1 1 0 0 0 3.07 11h4.347a1 1 0 0 0 .917-.6 4 4 0 0 1 5.387-2.013 1 1 0 0 0 1.138-.195l3.029-3.029a1 1 0 0 0-.14-1.53A10.1 10.1 0 0 0 12 1.85Z"/><path fill={color || "currentColor"} d="M3.07 13a1 1 0 0 0-.977 1.218 10.16 10.16 0 0 0 7.69 7.689A1 1 0 0 0 11 20.93v-4.347a1 1 0 0 0-.6-.916A4.02 4.02 0 0 1 8.333 13.6a1 1 0 0 0-.917-.6z"/></g><path fill={color || "currentColor"} d="M20.768 6.883a1 1 0 0 0-1.57-.202l-3.13 3.129a1 1 0 0 0-.248 1.004 4 4 0 0 1-2.221 4.855 1 1 0 0 0-.6.916v4.347a1 1 0 0 0 1.218.976c4.538-1.012 7.932-5.062 7.932-9.907a10.1 10.1 0 0 0-1.382-5.117Z"/>
    </svg>
  );
}
