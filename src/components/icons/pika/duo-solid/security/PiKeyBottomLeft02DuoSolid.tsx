import React from 'react';

/**
 * PiKeyBottomLeft02DuoSolid icon from the duo-solid style in security category.
 */
interface PiKeyBottomLeft02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyBottomLeft02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'key-bottom-left-02 icon',
  ...props
}: PiKeyBottomLeft02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M11.063 10.61a1 1 0 0 1-.24-.39 5.5 5.5 0 1 1 3.457 3.458 1 1 0 0 1-.389-.24l-1.745 1.744h-1.62a.5.5 0 0 0-.5.5v1.621l-2.122 2.122H5.075v-2.829z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.45 8.464 16.036 7.05a1.25 1.25 0 0 1 1.414 1.414Z"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11.44 10.232-6.365 6.364v2.829h2.83l2.12-2.122v-1.621a.5.5 0 0 1 .5-.5h1.621l2.122-2.121"/>
    </svg>
  );
}
