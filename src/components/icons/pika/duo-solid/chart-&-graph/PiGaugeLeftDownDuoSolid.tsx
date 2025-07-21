import React from 'react';

/**
 * PiGaugeLeftDownDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiGaugeLeftDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeLeftDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-left-down icon',
  ...props
}: PiGaugeLeftDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M7 16.075a1 1 0 0 1 .197-.671l3.468-4.623a1.826 1.826 0 1 1 2.555 2.555l-4.623 3.468A1 1 0 0 1 7 16.074Z"/>
    </svg>
  );
}
