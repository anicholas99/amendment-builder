import React from 'react';

/**
 * PiBusFrontViewContrast icon from the contrast style in automotive category.
 */
interface PiBusFrontViewContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBusFrontViewContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'bus-front-view icon',
  ...props
}: PiBusFrontViewContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4 9.333c0-2.177 0-3.266.413-4.102A4 4 0 0 1 6.23 3.413C7.067 3 8.156 3 10.333 3h3.334c2.177 0 3.266 0 4.102.413a4 4 0 0 1 1.819 1.818C20 6.067 20 7.156 20 9.333V20.5a1.5 1.5 0 0 1-3 0V19H7v1.5a1.5 1.5 0 0 1-3 0z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9.333c0-2.177 0-3.266.413-4.102A4 4 0 0 1 6.23 3.413C7.067 3 8.156 3 10.333 3h3.334c2.177 0 3.266 0 4.102.413a4 4 0 0 1 1.819 1.818C20 6.067 20 7.156 20 9.333V20.5a1.5 1.5 0 0 1-3 0V19H7v1.5a1.5 1.5 0 0 1-3 0z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h16" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16h1" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16h1" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9H2.5a.5.5 0 0 1-.5-.5V8a3 3 0 0 1 2.5-2.958M20 9h1.5a.5.5 0 0 0 .5-.5V8a3 3 0 0 0-2.5-2.958" fill="none"/>
    </svg>
  );
}
