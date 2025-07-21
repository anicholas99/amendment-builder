import React from 'react';

/**
 * PiUserThreeDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserThreeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserThreeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-three icon',
  ...props
}: PiUserThreeDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <g opacity=".28"><path fill={color || "currentColor"} d="M5 18.75A4.75 4.75 0 0 1 9.75 14h4.5A4.75 4.75 0 0 1 19 18.75 3.25 3.25 0 0 1 15.75 22h-7.5A3.25 3.25 0 0 1 5 18.75Z"/><path fill={color || "currentColor"} d="M3.925 15.862A1 1 0 0 0 2.57 14.53 4.75 4.75 0 0 0 0 18.75a3.25 3.25 0 0 0 2.39 3.135 1 1 0 0 0 1.197-1.327 5 5 0 0 1-.337-1.808c0-1.04.243-2.019.675-2.888Z"/><path fill={color || "currentColor"} d="M21.43 14.529a1 1 0 0 0-1.355 1.333c.432.869.675 1.849.675 2.888 0 .64-.12 1.249-.337 1.808a1 1 0 0 0 1.197 1.327A3.25 3.25 0 0 0 24 18.75a4.75 4.75 0 0 0-2.57-4.221Z"/></g><path fill={color || "currentColor"} d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z"/><path fill={color || "currentColor"} d="M5.983 3.938a1 1 0 0 0-1.369-1.333 5 5 0 0 0 0 8.79 1 1 0 0 0 1.369-1.333A6.7 6.7 0 0 1 5.25 7c0-1.104.264-2.144.733-3.062Z"/><path fill={color || "currentColor"} d="M19.386 2.605a1 1 0 0 0-1.369 1.333c.468.918.733 1.958.733 3.062a6.7 6.7 0 0 1-.733 3.062 1 1 0 0 0 1.369 1.333 5 5 0 0 0 0-8.79Z"/>
    </svg>
  );
}
