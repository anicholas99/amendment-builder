import React from 'react';

/**
 * PiHashtagDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiHashtagDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHashtagDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'hashtag icon',
  ...props
}: PiHashtagDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 20 3-16m4 16 3-16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 15h-16m17-6h-16" fill="none"/>
    </svg>
  );
}
