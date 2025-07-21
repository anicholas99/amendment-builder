import React from 'react';

/**
 * PiLinkHorizontalDuoStroke icon from the duo-stroke style in development category.
 */
interface PiLinkHorizontalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLinkHorizontalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'link-horizontal icon',
  ...props
}: PiLinkHorizontalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7h1a5 5 0 0 1 0 10h-1M9 7H8a5 5 0 0 0 0 10h1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9" fill="none"/>
    </svg>
  );
}
