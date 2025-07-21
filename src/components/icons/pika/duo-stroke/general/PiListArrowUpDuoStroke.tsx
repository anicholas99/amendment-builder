import React from 'react';

/**
 * PiListArrowUpDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListArrowUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListArrowUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-arrow-up icon',
  ...props
}: PiListArrowUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h8m-8 6h8M4 6h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 14.312a15 15 0 0 1 2.556-2.655A.7.7 0 0 1 19 11.5m3 2.812a15 15 0 0 0-2.556-2.655A.7.7 0 0 0 19 11.5m0 0v7.497" fill="none"/>
    </svg>
  );
}
