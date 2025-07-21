import React from 'react';

/**
 * PiMapPinDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiMapPinDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapPinDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'map-pin icon',
  ...props
}: PiMapPinDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5c1.948 0 7.79-4.111 7.79-10.278C19.79 5.056 14.922 3 12 3c-2.92 0-7.79 2.056-7.79 8.222C4.21 17.39 10.054 21.5 12 21.5Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.001 13.71a2.921 2.921 0 1 0 0-5.842 2.921 2.921 0 0 0 0 5.842Z" fill="none"/>
    </svg>
  );
}
