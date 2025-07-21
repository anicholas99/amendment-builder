import React from 'react';

/**
 * PiBurgerMenuFourDuoStroke icon from the duo-stroke style in general category.
 */
interface PiBurgerMenuFourDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBurgerMenuFourDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'burger-menu-four icon',
  ...props
}: PiBurgerMenuFourDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h16M4 4h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9h16M4 19h16" fill="none"/>
    </svg>
  );
}
