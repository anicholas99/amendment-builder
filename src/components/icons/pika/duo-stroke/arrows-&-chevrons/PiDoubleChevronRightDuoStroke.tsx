import React from 'react';

/**
 * PiDoubleChevronRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiDoubleChevronRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDoubleChevronRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'double-chevron-right icon',
  ...props
}: PiDoubleChevronRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596A20.4 20.4 0 0 0 7 8" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596A20.4 20.4 0 0 0 13 8" fill="none"/>
    </svg>
  );
}
