import React from 'react';

/**
 * PiMaximizeFourLineArrowDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiMaximizeFourLineArrowDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMaximizeFourLineArrowDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'maximize-four-line-arrow icon',
  ...props
}: PiMaximizeFourLineArrowDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.778 20.778 15 15M3.222 3.222 9 9M3.222 20.778 9 15M20.778 3.222 15 9" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 20.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .471-.471A17.3 17.3 0 0 0 20.759 16M8 3.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.471.471A17.3 17.3 0 0 0 3.24 8M8 20.76a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.471-.471A17.3 17.3 0 0 1 3.24 16M16 3.24a17.3 17.3 0 0 1 4.456-.167.52.52 0 0 1 .471.471A17.3 17.3 0 0 1 20.759 8" fill="none"/>
    </svg>
  );
}
