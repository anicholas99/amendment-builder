import React from 'react';

/**
 * PiBankDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiBankDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBankDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bank icon',
  ...props
}: PiBankDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13v5m5-5v5m6-5v5m5-5v5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 21h20m0-11H2V9l8.08-6.06c.688-.516 1.033-.775 1.41-.874a2 2 0 0 1 1.02 0c.377.1.722.358 1.41.874L22 9z" fill="none"/>
    </svg>
  );
}
