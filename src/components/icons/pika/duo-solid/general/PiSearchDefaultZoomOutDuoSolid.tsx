import React from 'react';

/**
 * PiSearchDefaultZoomOutDuoSolid icon from the duo-solid style in general category.
 */
interface PiSearchDefaultZoomOutDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSearchDefaultZoomOutDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'search-default-zoom-out icon',
  ...props
}: PiSearchDefaultZoomOutDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M10 2a8 8 0 1 0 4.906 14.32l5.387 5.387a1 1 0 0 0 1.414-1.414l-5.387-5.387A8 8 0 0 0 10 2Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.001 10h6"/>
    </svg>
  );
}
