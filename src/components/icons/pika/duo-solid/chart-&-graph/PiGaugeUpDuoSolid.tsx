import React from 'react';

/**
 * PiGaugeUpDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiGaugeUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-up icon',
  ...props
}: PiGaugeUpDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M12 6a1 1 0 0 1 .983.815l.922 4.887.03.222a1.94 1.94 0 1 1-3.84-.222l.923-4.887.02-.087A1 1 0 0 1 12 6Z"/>
    </svg>
  );
}
