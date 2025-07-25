import React from 'react';

/**
 * PiAnnotationStarDuoSolid icon from the duo-solid style in communication category.
 */
interface PiAnnotationStarDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAnnotationStarDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'annotation-star icon',
  ...props
}: PiAnnotationStarDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8.537 2c-1.027 0-1.86 0-2.534.055-.695.057-1.31.177-1.882.468a4.8 4.8 0 0 0-2.097 2.098c-.291.57-.412 1.186-.468 1.881C1.5 7.177 1.5 8.01 1.5 9.037v4.693c0 .618 0 1.045.059 1.42a4.8 4.8 0 0 0 3.99 3.99c.378.06.741.058 1.03.053l.1-.001c.262-.004.459-.007.653.01a.9.9 0 0 1 .584.293c.192.211.341.421.522.675.097.136.202.285.328.453l.027.035c.39.52.722.963 1.021 1.296.31.346.666.667 1.133.849a2.9 2.9 0 0 0 2.103 0c.467-.182.823-.503 1.133-.849.3-.333.632-.776 1.022-1.296l.026-.035c.126-.168.232-.317.329-.453a7 7 0 0 1 .522-.675.9.9 0 0 1 .583-.292c.195-.018.392-.015.654-.011l.1.001a6 6 0 0 0 1.03-.053 4.8 4.8 0 0 0 3.99-3.99c.06-.375.06-.802.059-1.42V9.037c0-1.028 0-1.86-.055-2.535-.057-.695-.177-1.31-.468-1.881a4.8 4.8 0 0 0-2.098-2.098c-.57-.29-1.186-.411-1.881-.468C17.322 2 16.49 2 15.462 2z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c.004.1.005.151.008.195a3 3 0 0 0 2.797 2.797L15 11c-.1.004-.151.005-.195.008a3 3 0 0 0-2.797 2.797L12 14c-.004-.1-.005-.151-.008-.195a3 3 0 0 0-2.797-2.797L9 11c.1-.004.151-.005.195-.008a3 3 0 0 0 2.797-2.797z"/>
    </svg>
  );
}
