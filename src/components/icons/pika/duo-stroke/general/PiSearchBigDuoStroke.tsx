import React from 'react';

/**
 * PiSearchBigDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSearchBigDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSearchBigDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'search-big icon',
  ...props
}: PiSearchBigDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.51 17.51 21 21" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 11.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" fill="none"/>
    </svg>
  );
}
