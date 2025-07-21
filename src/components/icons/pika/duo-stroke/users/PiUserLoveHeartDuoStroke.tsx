import React from 'react';

/**
 * PiUserLoveHeartDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserLoveHeartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserLoveHeartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-love-heart icon',
  ...props
}: PiUserLoveHeartDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.402 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h1.215" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21.32c.4 0 4-1.945 4-4.667 0-1.361-1.2-2.316-2.4-2.333-.6-.009-1.2.194-1.6.777-.4-.583-1.01-.777-1.6-.777-1.2 0-2.4.972-2.4 2.333 0 2.722 3.6 4.666 4 4.666Z" fill="none"/>
    </svg>
  );
}
