import React from 'react';

/**
 * PiSearchDefaultZoomInDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSearchDefaultZoomInDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSearchDefaultZoomInDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'search-default-zoom-in icon',
  ...props
}: PiSearchDefaultZoomInDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.95 14.95a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Zm0 0L21 21" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 13v-3m0 0V7m0 3H7m3 0h3" fill="none"/>
    </svg>
  );
}
