import React from 'react';

/**
 * PiArrowLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left icon',
  ...props
}: PiArrowLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.83 6a30.2 30.2 0 0 0-5.62 5.406.95.95 0 0 0 0 1.188A30.2 30.2 0 0 0 9.83 18" fill="none"/>
    </svg>
  );
}
