import React from 'react';

/**
 * PiPackage01DuoSolid icon from the duo-solid style in development category.
 */
interface PiPackage01DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPackage01DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'package-01 icon',
  ...props
}: PiPackage01DuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="m20.928 6.06.033.035-3.718 1.98-8.856-5.18.757-.42c.79-.437 1.372-.76 2.008-.89a4.25 4.25 0 0 1 1.696 0c.636.13 1.219.453 2.008.89l4.261 2.359c.785.433 1.371.757 1.811 1.226Z"/><path fill={color || "currentColor"} d="m4.883 4.834 1.469-.813 8.817 5.158L12 10.867 3.04 6.095l.032-.035c.44-.469 1.026-.793 1.81-1.226Z"/><path fill={color || "currentColor"} d="M14.856 21.525c-.726.402-1.277.708-1.856.855V12.6l8.894-4.736C22 8.376 22 8.94 22 9.635v4.73c0 .864.001 1.526-.205 2.135a4 4 0 0 1-.867 1.44c-.44.469-1.026.793-1.81 1.227z"/></g><path fill={color || "currentColor"} d="M2.107 7.864C1.999 8.376 2 8.94 2 9.635v4.73c0 .864-.001 1.526.206 2.135.181.536.477 1.026.866 1.44.44.469 1.026.793 1.81 1.226l4.262 2.359c.726.402 1.277.708 1.856.855V12.6z"/>
    </svg>
  );
}
