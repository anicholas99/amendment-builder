import React from 'react';

/**
 * PiSearchBigZoomOutContrast icon from the contrast style in general category.
 */
interface PiSearchBigZoomOutContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSearchBigZoomOutContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'search-big-zoom-out icon',
  ...props
}: PiSearchBigZoomOutContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20 11.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.51 17.51A8.5 8.5 0 1 0 5.49 5.49a8.5 8.5 0 0 0 12.02 12.02Zm0 0L21 21M8.5 11.5h6" fill="none"/>
    </svg>
  );
}
