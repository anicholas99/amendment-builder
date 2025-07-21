import React from 'react';

/**
 * PiMapPinDuoSolid icon from the duo-solid style in navigation category.
 */
interface PiMapPinDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapPinDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'map-pin icon',
  ...props
}: PiMapPinDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2c-1.662 0-3.84.576-5.62 2.022-1.818 1.477-3.17 3.819-3.17 7.2 0 3.41 1.616 6.214 3.44 8.14.914.965 1.9 1.73 2.806 2.262.866.508 1.786.876 2.544.876.76 0 1.68-.369 2.545-.876.906-.531 1.892-1.297 2.806-2.263 1.824-1.925 3.439-4.728 3.439-8.139 0-3.381-1.35-5.723-3.17-7.2C15.84 2.576 13.663 2 12 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M12.001 7.368a3.421 3.421 0 1 0 0 6.842 3.421 3.421 0 0 0 0-6.842Z"/>
    </svg>
  );
}
