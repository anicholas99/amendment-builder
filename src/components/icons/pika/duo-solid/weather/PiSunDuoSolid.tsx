import React from 'react';

/**
 * PiSunDuoSolid icon from the duo-solid style in weather category.
 */
interface PiSunDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSunDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'sun icon',
  ...props
}: PiSunDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} clipPath="url(#icon-hvkqjaio2-a)"><path fill={color || "currentColor"} d="M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1ZM3.515 3.515a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414Zm16.97 0a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM0 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1Zm21 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM5.636 18.364a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0Zm12.728 0a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414ZM12 21a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" clipRule="evenodd"/></g><defs><clipPath id="icon-hvkqjaio2-a"><path fill={color || "currentColor"} d="M0 0h24v24H0z"/></clipPath></defs>
    </svg>
  );
}
