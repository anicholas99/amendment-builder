import React from 'react';

/**
 * PiSwapHalfarrowHorizontalDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiSwapHalfarrowHorizontalDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwapHalfarrowHorizontalDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'swap-halfarrow-horizontal icon',
  ...props
}: PiSwapHalfarrowHorizontalDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.344 10H6m.656 4H18" opacity=".28"/><path fill={color || "currentColor"} d="M16.63 5.124a1 1 0 0 1 1.078.072 21.2 21.2 0 0 1 3.933 3.783c.238.297.359.659.359 1.021a1 1 0 0 1-1 1h-3.656a1 1 0 0 1-1-1q0-.852-.063-1.703l-.165-2.223a1 1 0 0 1 .514-.95Z"/><path fill={color || "currentColor"} d="M7.37 18.876a1 1 0 0 1-1.078-.072 21.2 21.2 0 0 1-3.933-3.783A1.63 1.63 0 0 1 2 14a1 1 0 0 1 1-1h3.656a1 1 0 0 1 1 1q0 .852.063 1.703l.165 2.223a1 1 0 0 1-.514.95Z"/>
    </svg>
  );
}
