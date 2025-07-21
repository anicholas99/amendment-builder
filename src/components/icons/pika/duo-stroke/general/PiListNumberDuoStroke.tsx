import React from 'react';

/**
 * PiListNumberDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListNumberDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListNumberDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-number icon',
  ...props
}: PiListNumberDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 6H11m10 6H11m10 6H11" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10V4.755C4.324 4.92 3.807 5.386 3.5 6M7 19H3.608v-.5c.882-.618 1.786-1.201 2.51-2.011.482-.541.536-1.351.015-1.895-.423-.441-1.154-.586-1.717-.367-.38.148-.597.444-.808.773" fill="none"/>
    </svg>
  );
}
