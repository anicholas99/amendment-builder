import React from 'react';

/**
 * PiArrowLeftDownDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowLeftDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-down icon',
  ...props
}: PiArrowLeftDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.863 18.137 18.591 5.409" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.743 9.772a30.2 30.2 0 0 0-.152 7.797.95.95 0 0 0 .84.84c2.59.286 5.21.235 7.798-.152" fill="none"/>
    </svg>
  );
}
