import React from 'react';

/**
 * PiBurgerDuoSolid icon from the duo-solid style in food category.
 */
interface PiBurgerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBurgerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'burger icon',
  ...props
}: PiBurgerDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M18.613 4.284C20.454 5.149 22 6.605 22 8.757 22 10.079 20.856 11 19.64 11H4.36C3.145 11 2 10.079 2 8.757c0-2.152 1.546-3.608 3.387-4.473C7.247 3.411 9.653 3 12 3s4.753.41 6.613 1.284Z"/><path fill={color || "currentColor"} d="M2 17.6A1.6 1.6 0 0 1 3.6 16h16.8a1.6 1.6 0 0 1 1.6 1.6 3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 17.6Z"/></g><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.334 13.5c-.948.667-2.386.667-3.334 0-.947-.667-2.386-.667-3.333 0s-2.386.667-3.333 0-2.386-.667-3.334 0c-.947.667-2.386.667-3.333 0"/>
    </svg>
  );
}
