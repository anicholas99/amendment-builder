import React from 'react';

/**
 * PiPeopleMaleMaleDuoSolid icon from the duo-solid style in users category.
 */
interface PiPeopleMaleMaleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPeopleMaleMaleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'people-male-male icon',
  ...props
}: PiPeopleMaleMaleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M5.26 9a4 4 0 0 0-3.986 3.668l-.27 3.25A1 1 0 0 0 2 17h1.065l.232 3.47a2.71 2.71 0 0 0 5.409-.002l.228-3.446 1.042.025a1 1 0 0 0 1.02-1.082l-.272-3.295A4 4 0 0 0 6.738 9zm12 0a4 4 0 0 0-3.986 3.668l-.27 3.25A1 1 0 0 0 14 17h1.065l.232 3.47a2.71 2.71 0 0 0 5.409-.002l.228-3.446 1.042.025a1 1 0 0 0 1.02-1.082l-.272-3.295A4 4 0 0 0 18.738 9z" clipRule="evenodd"/><g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M3 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"/><path fill={color || "currentColor"} d="M18 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></g>
    </svg>
  );
}
