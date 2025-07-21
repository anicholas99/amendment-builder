import React from 'react';

/**
 * PiListTextWrapDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListTextWrapDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListTextWrapDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-text-wrap icon',
  ...props
}: PiListTextWrapDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18h2.5M4 6h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h13a3 3 0 1 1 0 6h-6m2.812 3a15 15 0 0 1-2.655-2.556A.7.7 0 0 1 11 18m2.812-3a15 15 0 0 0-2.655 2.556A.7.7 0 0 0 11 18" fill="none"/>
    </svg>
  );
}
