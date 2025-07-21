import React from 'react';

/**
 * PiShoppingCartDuoStroke icon from the duo-stroke style in general category.
 */
interface PiShoppingCartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShoppingCartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'shopping-cart icon',
  ...props
}: PiShoppingCartDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none"/><path d="M18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 3h1.225c.984 0 1.476 0 1.872.181a2 2 0 0 1 .852.739c.235.366.304.853.443 1.827L6.572 7m0 0 1.036 7.253c.139.974.208 1.46.443 1.827a2 2 0 0 0 .852.74c.396.18.888.18 1.872.18h3.497c2.025 0 3.038 0 3.844-.378a4 4 0 0 0 1.717-1.536c.464-.76.576-1.766.8-3.779l.09-.82c.097-.867.145-1.3.01-1.645a1.5 1.5 0 0 0-.609-.73c-.315-.194-.75-.225-1.62-.285z" fill="none"/>
    </svg>
  );
}
