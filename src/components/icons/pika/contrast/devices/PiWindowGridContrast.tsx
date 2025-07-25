import React from 'react';

/**
 * PiWindowGridContrast icon from the contrast style in devices category.
 */
interface PiWindowGridContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWindowGridContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'window-grid icon',
  ...props
}: PiWindowGridContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M21 4h16v18H21z" opacity=".28" transform="rotate(90 21 4)" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 17V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14v2H7v-2zm7 0v2h-3v-2zm-7-6v2H7V8zm7 0v2h-3V8z" fill="none"/>
    </svg>
  );
}
