import React from 'react';

/**
 * PiUserRectangleDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserRectangleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserRectangleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-rectangle icon',
  ...props
}: PiUserRectangleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.092 16.904c.6-.56 1.405-.904 2.29-.904h7.235c.886 0 1.692.343 2.292.904M14.999 10c0 1.634-1.365 3-3 3-1.633 0-3-1.366-3-3s1.367-3 3-3c1.635 0 3 1.366 3 3Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10.2c0-2.52 0-3.78.49-4.743A4.5 4.5 0 0 1 6.457 3.49C7.42 3 8.68 3 11.2 3h1.6c2.52 0 3.78 0 4.743.49a4.5 4.5 0 0 1 1.967 1.967C20 6.42 20 7.68 20 10.2v3.6c0 2.52 0 3.78-.49 4.743a4.5 4.5 0 0 1-1.967 1.967C16.58 21 15.32 21 12.8 21h-1.6c-2.52 0-3.78 0-4.743-.49a4.5 4.5 0 0 1-1.967-1.967C4 17.58 4 16.32 4 13.8z" opacity=".28" fill="none"/>
    </svg>
  );
}
