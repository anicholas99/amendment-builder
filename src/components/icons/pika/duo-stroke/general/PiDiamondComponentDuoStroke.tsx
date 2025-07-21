import React from 'react';

/**
 * PiDiamondComponentDuoStroke icon from the duo-stroke style in general category.
 */
interface PiDiamondComponentDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDiamondComponentDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'diamond-component icon',
  ...props
}: PiDiamondComponentDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M3.939 9.808c.594-.594.89-.89 1.233-1.002a1.5 1.5 0 0 1 .927 0c.343.111.64.408 1.234 1.002l.495.495c.594.594.891.891 1.002 1.234a1.5 1.5 0 0 1 0 .927c-.111.342-.408.64-1.002 1.233l-.495.495c-.594.594-.891.891-1.234 1.002a1.5 1.5 0 0 1-.927 0c-.342-.11-.64-.408-1.233-1.002l-.495-.495c-.594-.594-.891-.89-1.002-1.233a1.5 1.5 0 0 1 0-.927c.11-.343.408-.64 1.002-1.234z" fill="none"/><path d="M16.667 9.808c.594-.594.89-.89 1.233-1.002a1.5 1.5 0 0 1 .928 0c.342.111.639.408 1.233 1.002l.495.495c.594.594.891.891 1.002 1.234a1.5 1.5 0 0 1 0 .927c-.111.342-.408.64-1.002 1.233l-.495.495c-.594.594-.891.891-1.233 1.002a1.5 1.5 0 0 1-.928 0c-.342-.11-.64-.408-1.233-1.002l-.495-.495c-.594-.594-.891-.89-1.002-1.233a1.5 1.5 0 0 1 0-.927c.11-.343.408-.64 1.002-1.234z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.303 3.444c.594-.594.891-.891 1.234-1.002a1.5 1.5 0 0 1 .927 0c.342.11.64.408 1.233 1.002l.495.495c.594.594.891.89 1.002 1.233a1.5 1.5 0 0 1 0 .927c-.11.343-.408.64-1.002 1.234l-.495.495c-.594.594-.89.891-1.233 1.002a1.5 1.5 0 0 1-.927 0c-.343-.111-.64-.408-1.234-1.002l-.495-.495c-.594-.594-.89-.891-1.002-1.234a1.5 1.5 0 0 1 0-.927c.111-.342.408-.64 1.002-1.233z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.303 16.172c.594-.594.891-.891 1.234-1.002a1.5 1.5 0 0 1 .927 0c.342.11.64.408 1.233 1.002l.495.495c.594.594.891.89 1.002 1.233a1.5 1.5 0 0 1 0 .928c-.11.342-.408.639-1.002 1.233l-.495.495c-.594.594-.89.891-1.233 1.002a1.5 1.5 0 0 1-.927 0c-.343-.111-.64-.408-1.234-1.002l-.495-.495c-.594-.594-.89-.891-1.002-1.233a1.5 1.5 0 0 1 0-.928c.111-.342.408-.64 1.002-1.233z" fill="none"/>
    </svg>
  );
}
