import React from 'react';

/**
 * PiBurgerMenuThreeDuoStroke icon from the duo-stroke style in general category.
 */
interface PiBurgerMenuThreeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBurgerMenuThreeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'burger-menu-three icon',
  ...props
}: PiBurgerMenuThreeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18h16M4 6h16" fill="none"/>
    </svg>
  );
}
