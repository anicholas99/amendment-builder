import React from 'react';

/**
 * PiLayersToDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiLayersToDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayersToDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'layers-to icon',
  ...props
}: PiLayersToDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M11.379.76c1.559-.309 3.029.384 3.853 1.577a3.74 3.74 0 0 0-1.818-.085L6.172 3.687C4.386 4.042 3.11 5.62 3.098 7.442l-.05 7.5c-.005.833.25 1.6.684 2.23a3.855 3.855 0 0 1-2.72-3.72l.05-7.501c.012-1.822 1.288-3.4 3.075-3.755z"/><path fill={color || "currentColor"} d="M14.914 3.752c1.558-.31 3.027.382 3.851 1.573a3.74 3.74 0 0 0-1.803-.081L9.72 6.68c-1.786.354-3.062 1.932-3.074 3.754l-.05 7.5a3.86 3.86 0 0 0 .686 2.233 3.855 3.855 0 0 1-2.734-3.725l.05-7.5c.012-1.822 1.288-3.4 3.074-3.755z"/></g><path fill={color || "currentColor"} d="M18.463 6.744c2.38-.472 4.553 1.392 4.537 3.806l-.05 7.5c-.012 1.821-1.287 3.4-3.074 3.755l-7.242 1.435c-2.38.472-4.553-1.392-4.538-3.805l.05-7.501c.012-1.822 1.288-3.4 3.074-3.754z"/>
    </svg>
  );
}
