import React from 'react';

/**
 * PiDiscountBadgeDuoStroke icon from the duo-stroke style in general category.
 */
interface PiDiscountBadgeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDiscountBadgeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'discount-badge icon',
  ...props
}: PiDiscountBadgeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.863 20.322a2.925 2.925 0 0 0 4.274 0 2.93 2.93 0 0 1 2.236-.926 2.925 2.925 0 0 0 3.023-3.023 2.93 2.93 0 0 1 .926-2.236 2.925 2.925 0 0 0 0-4.274 2.93 2.93 0 0 1-.926-2.236 2.925 2.925 0 0 0-3.023-3.023 2.93 2.93 0 0 1-2.236-.926 2.925 2.925 0 0 0-4.274 0 2.93 2.93 0 0 1-2.236.926 2.925 2.925 0 0 0-3.023 3.023 2.93 2.93 0 0 1-.926 2.236 2.925 2.925 0 0 0 0 4.274c.617.577.955 1.392.926 2.236a2.925 2.925 0 0 0 3.023 3.023 2.93 2.93 0 0 1 2.236.926Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15.364 15.364 9m-6.114.25h.01m5.854 5.864h.01M9.5 9.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Z" fill="none"/>
    </svg>
  );
}
