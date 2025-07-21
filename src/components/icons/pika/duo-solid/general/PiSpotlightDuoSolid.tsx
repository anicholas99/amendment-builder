import React from 'react';

/**
 * PiSpotlightDuoSolid icon from the duo-solid style in general category.
 */
interface PiSpotlightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpotlightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spotlight icon',
  ...props
}: PiSpotlightDuoSolidProps): JSX.Element {
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
      <g clipPath="url(#icon-87rciklk6-a)"><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.718 10 9 20.5M9.329 7l12.833 12.673" opacity=".28"/><path fill={color || "currentColor"} d="M6.286 2.108a3 3 0 0 0-4.915 3.441L2.52 7.187a1 1 0 0 0 1.392.246l3.277-2.294a1 1 0 0 0 .245-1.393zm-3.03.901a1 1 0 0 1 1.392.246l.574.819-1.639 1.147-.573-.82a1 1 0 0 1 .245-1.392Z"/><path fill={color || "currentColor"} d="M16 17.5c-2.026 0-3.877.306-5.248.735-.68.213-1.284.469-1.74.76a2.8 2.8 0 0 0-.636.539c-.177.211-.376.54-.376.966s.199.755.376.966c.182.216.41.394.636.539.456.291 1.06.547 1.74.76 1.371.429 3.222.735 5.248.735s3.878-.306 5.249-.735c.68-.213 1.284-.469 1.74-.76.226-.145.454-.323.636-.54.177-.21.375-.54.375-.965s-.198-.755-.375-.966a2.8 2.8 0 0 0-.636-.539c-.456-.291-1.06-.547-1.74-.76-1.371-.43-3.223-.735-5.249-.735Z"/></g><defs><clipPath id="icon-87rciklk6-a"><path fill={color || "currentColor"} d="M0 0h24v24H0z"/></clipPath></defs>
    </svg>
  );
}
