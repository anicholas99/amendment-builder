import React from 'react';

/**
 * PiListCancelDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-cancel icon',
  ...props
}: PiListCancelDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h6m-6 6h6M4 6h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.5 17.497 2.5-2.5m0 0 2.5-2.5m-2.5 2.5-2.5-2.5m2.5 2.5 2.5 2.5" fill="none"/>
    </svg>
  );
}
