import React from 'react';

/**
 * PiDoubleChevronDownDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiDoubleChevronDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDoubleChevronDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'double-chevron-down icon',
  ...props
}: PiDoubleChevronDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7a20.4 20.4 0 0 0 3.702 3.894c.175.141.42.141.596 0A20.4 20.4 0 0 0 16 7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 13a20.4 20.4 0 0 0 3.702 3.894c.175.141.42.141.596 0A20.4 20.4 0 0 0 16 13" fill="none"/>
    </svg>
  );
}
