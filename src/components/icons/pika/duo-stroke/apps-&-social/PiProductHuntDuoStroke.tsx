import React from 'react';

/**
 * PiProductHuntDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiProductHuntDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiProductHuntDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'product-hunt icon',
  ...props
}: PiProductHuntDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 0 18.3 0 9.15 9.15 0 0 0-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 13.625V8h2.813a2.813 2.813 0 0 1 0 5.625zm0 0V17" fill="none"/>
    </svg>
  );
}
