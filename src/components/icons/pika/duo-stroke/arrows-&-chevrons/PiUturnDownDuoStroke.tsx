import React from 'react';

/**
 * PiUturnDownDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiUturnDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUturnDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'uturn-down icon',
  ...props
}: PiUturnDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 20V9a5 5 0 0 1 10 0v3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.917 15.969a20.8 20.8 0 0 0 3.679 3.886.64.64 0 0 0 .809 0 20.8 20.8 0 0 0 3.678-3.886" fill="none"/>
    </svg>
  );
}
