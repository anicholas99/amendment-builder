import React from 'react';

/**
 * PiBurgerDuoStroke icon from the duo-stroke style in food category.
 */
interface PiBurgerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBurgerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'burger icon',
  ...props
}: PiBurgerDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M3 8.757c0-6.342 18-6.342 18 0C21 9.443 20.39 10 19.64 10H4.36C3.61 10 3 9.443 3 8.757Z" fill="none"/><path d="M3 17.6A2.4 2.4 0 0 0 5.4 20h13.2a2.4 2.4 0 0 0 2.4-2.4.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.333 13.5c-.947.667-2.386.667-3.333 0s-2.386-.667-3.334 0c-.947.667-2.385.667-3.333 0-.947-.667-2.386-.667-3.333 0s-2.386.667-3.333 0" fill="none"/>
    </svg>
  );
}
