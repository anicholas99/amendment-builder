import React from 'react';

/**
 * PiUserCancelDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserCancelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserCancelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-cancel icon',
  ...props
}: PiUserCancelDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.17 14H7a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 2.529-1.385 3 3 0 0 1-.65-.494l-.379-.378-.379.378a3 3 0 1 1-4.242-4.242l.378-.379-.378-.379A3 3 0 0 1 13.17 14Z" opacity=".28"/><path fill={color || "currentColor"} d="M6 7a5 5 0 1 1 10 0A5 5 0 0 1 6 7Z"/><path fill={color || "currentColor"} d="m18.5 14.086-1.793-1.793a1 1 0 0 0-1.414 1.414l1.793 1.793-1.793 1.793a1 1 0 0 0 1.414 1.414l1.793-1.793 1.793 1.793a1 1 0 0 0 1.414-1.414L19.914 15.5l1.793-1.793a1 1 0 0 0-1.414-1.414z"/>
    </svg>
  );
}
