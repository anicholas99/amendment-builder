import React from 'react';

/**
 * PiGaugeRightUpDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiGaugeRightUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeRightUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-right-up icon',
  ...props
}: PiGaugeRightUpDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12 22.15C6.394 22.15 1.85 17.606 1.85 12 1.85 6.395 6.394 1.85 12 1.85S22.15 6.395 22.15 12 17.606 22.15 12 22.15Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M16.075 6.999a1 1 0 0 0-.67.197l-4.624 3.47a1.826 1.826 0 1 0 2.554 2.553l3.47-4.623A1 1 0 0 0 16.074 7Z"/>
    </svg>
  );
}
