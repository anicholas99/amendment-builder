import React from 'react';

/**
 * PiExchange01DuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiExchange01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiExchange01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'exchange-01 icon',
  ...props
}: PiExchange01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 20V7a3 3 0 1 0-6 0v10a3 3 0 1 1-6 0V4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 17.352a14.7 14.7 0 0 1-2.426 2.447.92.92 0 0 1-1.148 0A14.7 14.7 0 0 1 15 17.352M3 6.648a14.7 14.7 0 0 1 2.426-2.447.92.92 0 0 1 1.148 0C7.48 4.922 8.294 5.743 9 6.648" fill="none"/>
    </svg>
  );
}
