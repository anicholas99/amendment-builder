import React from 'react';

/**
 * PiUserLoveHeartDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserLoveHeartDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserLoveHeartDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-love-heart icon',
  ...props
}: PiUserLoveHeartDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10.711 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3h6.582C11.447 20.936 10 19.113 10 16.653c0-1.005.266-1.899.711-2.653Z" opacity=".28"/><path fill={color || "currentColor"} d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z"/><path fill={color || "currentColor"} d="M16.997 13.742a3 3 0 0 1 1.617-.422C20.26 13.343 22 14.65 22 16.653c0 1.802-1.174 3.221-2.194 4.108a9.6 9.6 0 0 1-1.516 1.08 6 6 0 0 1-.61.309 3 3 0 0 1-.274.102c-.068.021-.224.067-.406.067s-.338-.046-.405-.067a3 3 0 0 1-.275-.102 6 6 0 0 1-.61-.309 9.7 9.7 0 0 1-1.516-1.08C13.174 19.874 12 18.455 12 16.653c0-1.992 1.73-3.333 3.4-3.333.507 0 1.08.108 1.597.422Z"/>
    </svg>
  );
}
