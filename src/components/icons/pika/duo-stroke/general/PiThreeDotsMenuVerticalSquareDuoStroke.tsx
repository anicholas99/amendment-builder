import React from 'react';

/**
 * PiThreeDotsMenuVerticalSquareDuoStroke icon from the duo-stroke style in general category.
 */
interface PiThreeDotsMenuVerticalSquareDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreeDotsMenuVerticalSquareDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'three-dots-menu-vertical-square icon',
  ...props
}: PiThreeDotsMenuVerticalSquareDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.704 20.543C7.807 21 9.204 21 12 21s4.194 0 5.296-.457a6 6 0 0 0 3.247-3.247C21 16.194 21 14.796 21 12s0-4.193-.457-5.296a6 6 0 0 0-3.247-3.247C16.194 3 14.796 3 12 3s-4.193 0-5.296.457a6 6 0 0 0-3.247 3.247C3 7.807 3 9.204 3 12s0 4.194.457 5.296a6 6 0 0 0 3.247 3.247Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.005 16.006v-.01m0-3.99v-.01m0-3.99v-.01" fill="none"/>
    </svg>
  );
}
