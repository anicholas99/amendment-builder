import React from 'react';

/**
 * PiLabFlaskRoundContrast icon from the contrast style in general category.
 */
interface PiLabFlaskRoundContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLabFlaskRoundContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'lab-flask-round icon',
  ...props
}: PiLabFlaskRoundContrastProps): JSX.Element {
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
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3h4m-4 0H9m1 0v4.27a7.51 7.51 0 0 0-5.427 6.183M14 3h1m-1 0v4.27a7.5 7.5 0 0 1 5.486 7.696m0 0a7.5 7.5 0 1 1-14.913-1.513m14.913 1.513C14 17.5 12 10 4.573 13.453" fill="none"/><path fill="currentColor" d="M4.5 14.5a7.5 7.5 0 0 0 14.986.467C14 17.5 12 10 4.573 13.453a8 8 0 0 0-.073 1.048Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 16h.01" fill="none"/>
    </svg>
  );
}
