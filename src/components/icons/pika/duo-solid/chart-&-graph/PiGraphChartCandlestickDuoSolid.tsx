import React from 'react';

/**
 * PiGraphChartCandlestickDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiGraphChartCandlestickDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartCandlestickDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-candlestick icon',
  ...props
}: PiGraphChartCandlestickDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M3 2a1 1 0 0 1 1 1v14a3 3 0 0 0 3 3h14a1 1 0 1 1 0 2H7a5 5 0 0 1-5-5V3a1 1 0 0 1 1-1Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M17 2a1 1 0 0 1 1 1v1.052q.075.014.147.033a2.5 2.5 0 0 1 1.768 1.768c.086.323.086.685.085 1.054v2.186c0 .369.001.731-.085 1.054A2.5 2.5 0 0 1 18 11.948V17a1 1 0 0 1-2 0v-5.052q-.075-.014-.147-.033a2.5 2.5 0 0 1-1.768-1.768C14 9.824 14 9.462 14 9.093V6.907c0-.369-.001-.731.085-1.054A2.5 2.5 0 0 1 16 4.052V3a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M9 5a1 1 0 0 1 1 1v2.052q.075.014.147.033a2.5 2.5 0 0 1 1.768 1.768c.086.323.086.685.085 1.054v2.186c0 .369.001.731-.085 1.054A2.5 2.5 0 0 1 10 15.948V17a1 1 0 1 1-2 0v-1.052q-.075-.014-.147-.033a2.5 2.5 0 0 1-1.768-1.768C6 13.824 6 13.462 6 13.093v-2.186c0-.369-.001-.731.085-1.054A2.5 2.5 0 0 1 8 8.052V6a1 1 0 0 1 1-1Z"/>
    </svg>
  );
}
