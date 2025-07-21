import React from 'react';

/**
 * PiListCheckDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListCheckDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListCheckDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-check icon',
  ...props
}: PiListCheckDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h6m-6 6h6M4 6h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.5 14.978 2.341 2.339A15 15 0 0 1 20.4 12.38" fill="none"/>
    </svg>
  );
}
