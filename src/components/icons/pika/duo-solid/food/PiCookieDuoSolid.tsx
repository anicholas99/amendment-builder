import React from 'react';

/**
 * PiCookieDuoSolid icon from the duo-solid style in food category.
 */
interface PiCookieDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCookieDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cookie icon',
  ...props
}: PiCookieDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M11.965 2.395a1 1 0 0 1 .196.906q-.16.572-.161 1.199a4.5 4.5 0 0 0 4.93 4.48 1 1 0 0 1 1.09.89 3.5 3.5 0 0 0 2.926 3.087 1 1 0 0 1 .82 1.202C20.78 18.644 16.782 22 12 22 6.477 22 2 17.523 2 12c0-5.223 4.003-9.51 9.11-9.96a1 1 0 0 1 .855.355Z"/><path fill={color || "currentColor"} d="M17 5a1 1 0 1 0-2 0v.01a1 1 0 1 0 2 0z"/></g><path fill={color || "currentColor"} d="M20 4a1 1 0 0 1 1 1v.01a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M8.404 7.193a1 1 0 0 1 1 1v.01a1 1 0 0 1-2 0v-.01a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M6 13.018a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/><path fill={color || "currentColor"} d="M12.717 14.766a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/><path fill={color || "currentColor"} d="M10.79 16.684a1 1 0 0 1 1 1v.01a1 1 0 1 1-2 0v-.01a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M22 9a1 1 0 1 0-2 0v.01a1 1 0 1 0 2 0z"/>
    </svg>
  );
}
