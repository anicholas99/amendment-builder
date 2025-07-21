import React from 'react';

/**
 * PiGaugeRightDownDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiGaugeRightDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeRightDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-right-down icon',
  ...props
}: PiGaugeRightDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M16.075 17.001a1 1 0 0 1-.67-.197l-4.624-3.47a1.824 1.824 0 1 1 2.554-2.553l3.47 4.623a1 1 0 0 1-.73 1.597Z"/>
    </svg>
  );
}
