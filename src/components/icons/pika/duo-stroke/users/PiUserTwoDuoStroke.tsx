import React from 'react';

/**
 * PiUserTwoDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserTwoDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserTwoDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-two icon',
  ...props
}: PiUserTwoDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.395 21h.105a2 2 0 0 0 2-2 4 4 0 0 0-2.734-3.796M6 15h7a4 4 0 0 1 4 4 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2 4 4 0 0 1 4-4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.404 3.481a4 4 0 0 1 0 7.037M13.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
