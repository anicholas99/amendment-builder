import React from 'react';

/**
 * PiUserAIDuoSolid icon from the duo-solid style in ai category.
 */
interface PiUserAIDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserAIDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-ai icon',
  ...props
}: PiUserAIDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M14.372 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3h5.17a3 3 0 0 1 1.215-3.529A3 3 0 0 1 13.9 14.21a6 6 0 0 0 .473-.209Z" opacity=".28"/><path fill={color || "currentColor"} d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/><path fill={color || "currentColor"} d="M18 13a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 18 13Z"/><path fill={color || "currentColor"} d="M13 21a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z"/>
    </svg>
  );
}
