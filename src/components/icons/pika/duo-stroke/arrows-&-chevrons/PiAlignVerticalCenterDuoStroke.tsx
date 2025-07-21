import React from 'react';

/**
 * PiAlignVerticalCenterDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiAlignVerticalCenterDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignVerticalCenterDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'align-vertical-center icon',
  ...props
}: PiAlignVerticalCenterDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6.684a16.4 16.4 0 0 0 2.703 3.197A.44.44 0 0 0 12 10m3-3.316a16.4 16.4 0 0 1-2.703 3.197A.44.44 0 0 1 12 10m0 0V3m3 14.316a16.4 16.4 0 0 0-2.703-3.197A.44.44 0 0 0 12 14m-3 3.316a16.4 16.4 0 0 1 2.703-3.197A.44.44 0 0 1 12 14m0 0v7" fill="none"/>
    </svg>
  );
}
