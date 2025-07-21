import React from 'react';

/**
 * PiTShirtDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiTShirtDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTShirtDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 't-shirt-default icon',
  ...props
}: PiTShirtDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1.5 6 8 3l1.09.272a12 12 0 0 0 5.82 0L16 3l6.5 3-1.5 5-3-1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10l-3 1z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 10-3 1-1.5-5L8 3l1.09.272a12 12 0 0 0 5.82 0L16 3l6.5 3-1.5 5-3-1" fill="none"/>
    </svg>
  );
}
