import React from 'react';

/**
 * PiTrendlineUpDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiTrendlineUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrendlineUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'trendline-up icon',
  ...props
}: PiTrendlineUpDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 17.852.73-.938a21.8 21.8 0 0 1 6.61-5.663.696.696 0 0 1 .916.222l3.212 4.818a.64.64 0 0 0 .926.15 20 20 0 0 0 4.848-5.451" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M22.512 13.684a1 1 0 0 0 .479-.978 18.3 18.3 0 0 0-1.188-4.632 1.476 1.476 0 0 0-1.578-.911 18.3 18.3 0 0 0-4.606 1.287 1 1 0 0 0-.03 1.826l1.274.595a22.7 22.7 0 0 1 3.41 1.968l1.152.806a1 1 0 0 0 1.087.039Z" clipRule="evenodd"/>
    </svg>
  );
}
