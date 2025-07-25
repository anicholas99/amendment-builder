import React from 'react';

/**
 * PiGrid02DuoSolid icon from the duo-solid style in general category.
 */
interface PiGrid02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGrid02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-02 icon',
  ...props
}: PiGrid02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.357 2C8.273 2 7.4 2 6.691 2.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 4.73c-.302.592-.428 1.233-.487 1.961C2 7.4 2 8.273 2 9.357v5.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C7.4 22 8.273 22 9.357 22h5.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C22 16.6 22 15.727 22 14.643V9.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C16.6 2 15.727 2 14.643 2z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9h-6m0 0H9m6 0v6m0-6V3M9 9H3m6 0v6m0-6V3m6 18v-6m0 0h6m-6 0H9m0 0H3m6 0v6"/>
    </svg>
  );
}
