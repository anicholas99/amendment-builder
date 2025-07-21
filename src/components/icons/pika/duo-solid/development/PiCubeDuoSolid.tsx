import React from 'react';

/**
 * PiCubeDuoSolid icon from the duo-solid style in development category.
 */
interface PiCubeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCubeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cube icon',
  ...props
}: PiCubeDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M11.152 1.585a4.25 4.25 0 0 1 1.696 0c.636.13 1.219.453 2.008.89l4.261 2.359c.785.433 1.371.757 1.811 1.226l.033.035L12 10.867 3.04 6.095l.032-.035c.44-.469 1.026-.793 1.81-1.226l4.262-2.359c.79-.437 1.372-.76 2.008-.89Z"/><path fill={color || "currentColor"} d="M13 22.38c.579-.148 1.13-.453 1.856-.855l4.261-2.359c.785-.433 1.371-.757 1.811-1.226a4 4 0 0 0 .867-1.44c.206-.61.206-1.27.205-2.135v-4.73c0-.695.001-1.26-.107-1.771L13 12.6z"/></g><path fill={color || "currentColor"} d="M2.107 7.864C1.999 8.376 2 8.94 2 9.635v4.73c0 .864-.001 1.525.206 2.135.181.536.477 1.026.866 1.44.44.469 1.026.793 1.81 1.226l4.262 2.359c.726.402 1.277.707 1.856.855V12.6z"/>
    </svg>
  );
}
