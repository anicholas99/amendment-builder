import React from 'react';

/**
 * PiGridTableDuoSolid icon from the duo-solid style in general category.
 */
interface PiGridTableDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGridTableDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-table icon',
  ...props
}: PiGridTableDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M10 22h4.643c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961.032-.385.046-.819.052-1.309H10z"/><path fill={color || "currentColor"} d="M22 14v-4H10v4z"/><path fill={color || "currentColor"} d="M21.995 8a20 20 0 0 0-.053-1.309c-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C16.6 2 15.727 2 14.643 2H10v6z"/></g><path fill={color || "currentColor"} d="M8 2.005a20 20 0 0 0-1.309.053c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 4.73c-.302.592-.428 1.232-.487 1.961A20 20 0 0 0 2.005 8H8z"/><path fill={color || "currentColor"} d="M2 10v4h6v-4z"/><path fill={color || "currentColor"} d="M2.005 16c.007.49.021.924.053 1.308.06.73.185 1.37.487 1.962a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487.385.032.819.046 1.309.052V16z"/>
    </svg>
  );
}
