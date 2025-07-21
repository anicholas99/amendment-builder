import React from 'react';

/**
 * PiBalanceScaleLawDuoStroke icon from the duo-stroke style in general category.
 */
interface PiBalanceScaleLawDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBalanceScaleLawDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'balance-scale-law icon',
  ...props
}: PiBalanceScaleLawDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1.804 13c0-.457.1-.92.304-1.355L5 5.5l2.891 6.145c.205.435.304.898.305 1.355m7.608 0c0-.457.1-.92.304-1.355L19 5.5l2.891 6.145c.205.435.304.898.305 1.355M12 2v1.75" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 5a4.82 4.82 0 0 1-4.055.12l-1.583-.68A8.5 8.5 0 0 0 12 3.75M3 5a4.82 4.82 0 0 0 4.055.12l1.583-.68A8.5 8.5 0 0 1 12 3.75m0 0V21m0 0h4m-4 0H8m-6.196-8a3.195 3.195 0 1 0 6.392 0m7.608 0a3.195 3.195 0 1 0 6.392 0" fill="none"/>
    </svg>
  );
}
