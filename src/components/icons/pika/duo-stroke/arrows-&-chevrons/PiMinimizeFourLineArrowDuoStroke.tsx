import React from 'react';

/**
 * PiMinimizeFourLineArrowDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiMinimizeFourLineArrowDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMinimizeFourLineArrowDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'minimize-four-line-arrow icon',
  ...props
}: PiMinimizeFourLineArrowDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.222 15.222 21 21M8.778 8.778 3 3m5.778 12.222L3 21M15.222 8.778 21 3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 15.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.471.471A17.3 17.3 0 0 0 15.24 20M4 8.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .471-.471C9.064 6.98 9.007 5.482 8.76 4M4 15.24a17.3 17.3 0 0 1 4.456-.167.52.52 0 0 1 .471.471c.137 1.476.08 2.974-.167 4.456M20 8.76a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.471-.471A17.3 17.3 0 0 1 15.24 4" fill="none"/>
    </svg>
  );
}
