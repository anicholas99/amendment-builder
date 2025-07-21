import React from 'react';

/**
 * PiPiechart01DuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiPiechart01DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechart01DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-01 icon',
  ...props
}: PiPiechart01DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7.263 3.121c1.046-.567 2.163.262 2.163 1.308v6.145a4 4 0 0 0 4 4h6.145c1.046 0 1.875 1.117 1.308 2.163A10.04 10.04 0 0 1 12.044 22C6.497 22 2 17.503 2 11.956 2 8.138 4.13 4.82 7.263 3.121Z" opacity=".28"/><path fill={color || "currentColor"} d="M11.044 4.27c0-1.254 1.053-2.463 2.5-2.246a10.05 10.05 0 0 1 8.432 8.432c.217 1.447-.992 2.5-2.245 2.5H13.4a2.357 2.357 0 0 1-2.357-2.356z"/>
    </svg>
  );
}
