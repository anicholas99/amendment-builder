import React from 'react';

/**
 * PiAnimation02Contrast icon from the contrast style in media category.
 */
interface PiAnimation02ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAnimation02Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'animation-02 icon',
  ...props
}: PiAnimation02ContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M16 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14a5 5 0 0 1 5 5v-1a9 9 0 0 1 5.237-8.178M19 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="none"/>
    </svg>
  );
}
