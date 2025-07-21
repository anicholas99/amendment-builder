import React from 'react';

/**
 * PiPriorityCriticalDuoStroke icon from the duo-stroke style in development category.
 */
interface PiPriorityCriticalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPriorityCriticalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'priority-critical icon',
  ...props
}: PiPriorityCriticalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.307 4.16C9.255 5.234 7.39 6.456 5.75 7.805c-.488.402-.75.972-.75 1.564V20c1.815-1.603 3.935-3.044 6.307-4.285.203-.106.448-.16.693-.16s.49.054.693.16C15.065 16.956 17.185 18.397 19 20V9.369c0-.592-.262-1.162-.75-1.564-1.641-1.349-3.505-2.571-5.557-3.645A1.5 1.5 0 0 0 12 4c-.245 0-.49.053-.693.16Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.2 8.5c.126-.26.311-.498.55-.695 1.641-1.349 3.505-2.571 5.557-3.645.203-.107.448-.16.693-.16s.49.053.694.16c2.051 1.074 3.915 2.296 5.556 3.645.24.197.424.434.55.695" fill="none"/>
    </svg>
  );
}
