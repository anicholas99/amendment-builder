import React from 'react';

/**
 * PiBoldDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiBoldDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBoldDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bold icon',
  ...props
}: PiBoldDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12V5.773c0-.255 0-.382.045-.48a.5.5 0 0 1 .247-.248C7.392 5 7.518 5 7.772 5H12a3.5 3.5 0 0 1 3.5 3.5c0 1.935-1.615 3.5-3.535 3.5M7 12v6.2c0 .28 0 .42.054.527a.5.5 0 0 0 .219.218C7.38 19 7.52 19 7.8 19h5.7a3.5 3.5 0 1 0 0-7h-1.535M7 12h4.965" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.773 5c-.255 0-.382 0-.48.045a.5.5 0 0 0-.248.247C7 5.392 7 5.518 7 5.772V18.2c0 .28 0 .42.054.527a.5.5 0 0 0 .219.218C7.38 19 7.52 19 7.8 19" fill="none"/>
    </svg>
  );
}
