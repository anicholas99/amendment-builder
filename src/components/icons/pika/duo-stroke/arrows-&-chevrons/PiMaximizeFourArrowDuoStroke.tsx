import React from 'react';

/**
 * PiMaximizeFourArrowDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiMaximizeFourArrowDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMaximizeFourArrowDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'maximize-four-arrow icon',
  ...props
}: PiMaximizeFourArrowDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.667 19.744c1.58.264 3.178.324 4.753.179a.555.555 0 0 0 .503-.503 18.5 18.5 0 0 0-.18-4.753M4.258 9.333a18.5 18.5 0 0 1-.18-4.753.555.555 0 0 1 .503-.503 18.5 18.5 0 0 1 4.753.18" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.333 19.744a18.5 18.5 0 0 1-4.753.179.555.555 0 0 1-.503-.503 18.5 18.5 0 0 1 .18-4.753m10.41-10.41a18.5 18.5 0 0 1 4.753-.18.555.555 0 0 1 .503.503 18.5 18.5 0 0 1-.18 4.753" fill="none"/>
    </svg>
  );
}
