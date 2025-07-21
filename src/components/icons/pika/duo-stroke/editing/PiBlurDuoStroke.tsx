import React from 'react';

/**
 * PiBlurDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiBlurDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBlurDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'blur icon',
  ...props
}: PiBlurDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M9 4h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M9 20h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M15 4h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M15 20h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M20 15h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M20 9h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M4 9h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M4 15h.01" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none"/>
    </svg>
  );
}
