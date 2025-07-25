import React from 'react';

/**
 * PiSwapArrowVerticalContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiSwapArrowVerticalContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwapArrowVerticalContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'swap-arrow-vertical icon',
  ...props
}: PiSwapArrowVerticalContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M15.604 20.86A20.2 20.2 0 0 1 12 17.113l2.223.165a24 24 0 0 0 3.554 0L20 17.113a20.2 20.2 0 0 1-3.604 3.747.63.63 0 0 1-.792 0Z" fill="none" stroke="currentColor"/><path d="M4 6.887A20.2 20.2 0 0 1 7.604 3.14a.63.63 0 0 1 .792 0A20.2 20.2 0 0 1 12 6.887l-2.223-.165a24 24 0 0 0-3.554 0z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17.344V7m0 10.344q-.89 0-1.777-.066L12 17.113a20.2 20.2 0 0 0 3.604 3.747.63.63 0 0 0 .792 0A20.2 20.2 0 0 0 20 17.113l-2.223.165q-.888.066-1.777.066ZM8 6.656V17M8 6.656q-.89 0-1.777.066L4 6.887A20.2 20.2 0 0 1 7.604 3.14a.63.63 0 0 1 .792 0A20.2 20.2 0 0 1 12 6.887l-2.223-.165A24 24 0 0 0 8 6.656Z" fill="none"/>
    </svg>
  );
}
