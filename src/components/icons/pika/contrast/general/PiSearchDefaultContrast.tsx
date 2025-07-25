import React from 'react';

/**
 * PiSearchDefaultContrast icon from the contrast style in general category.
 */
interface PiSearchDefaultContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSearchDefaultContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'search-default icon',
  ...props
}: PiSearchDefaultContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M17 10a6.98 6.98 0 0 1-2.05 4.95A7 7 0 1 1 17 10Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6.05-6.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z" fill="none"/>
    </svg>
  );
}
