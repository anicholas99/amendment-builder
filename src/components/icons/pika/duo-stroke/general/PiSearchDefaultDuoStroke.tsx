import React from 'react';

/**
 * PiSearchDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSearchDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSearchDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'search-default icon',
  ...props
}: PiSearchDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.95 14.95 21 21" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 10a6.98 6.98 0 0 1-2.05 4.95A7 7 0 1 1 17 10Z" fill="none"/>
    </svg>
  );
}
