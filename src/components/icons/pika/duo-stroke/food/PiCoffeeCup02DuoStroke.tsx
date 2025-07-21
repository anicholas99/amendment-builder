import React from 'react';

/**
 * PiCoffeeCup02DuoStroke icon from the duo-stroke style in food category.
 */
interface PiCoffeeCup02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCoffeeCup02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'coffee-cup-02 icon',
  ...props
}: PiCoffeeCup02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.99 11H19a3 3 0 1 1 0 6h-2.487M6 6v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4m3 2v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4m3 2v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12.353V11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C17.24 10 16.96 10 16.4 10H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 10.76 2 11.04 2 11.6v.753a8 8 0 0 0 16 0Z" fill="none"/>
    </svg>
  );
}
