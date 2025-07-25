import React from 'react';

/**
 * PiForkKnifeDuoSolid icon from the duo-solid style in food category.
 */
interface PiForkKnifeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiForkKnifeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'fork-knife icon',
  ...props
}: PiForkKnifeDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.004 21V10.536m11 10.464v-4.926" opacity=".28"/><path fill={color || "currentColor"} d="M20.004 3.83c0-1.459-1.627-2.333-2.844-1.521a5.15 5.15 0 0 0-2.272 3.855l-.499 5.993c-.044.53-.077.923-.047 1.268a4 4 0 0 0 3.301 3.59c.341.06.735.06 1.267.06l.093-.001a1 1 0 0 0 1-1z"/><path fill={color || "currentColor"} d="M5.996 3.124a1 1 0 1 0-1.985-.248l-.453 3.625a4.48 4.48 0 1 0 8.89 0l-.452-3.625a1 1 0 0 0-1.985.248l.453 3.625a2.48 2.48 0 0 1-1.46 2.577V3a1 1 0 1 0-2 0v6.326a2.48 2.48 0 0 1-1.46-2.577z"/>
    </svg>
  );
}
