import React from 'react';

/**
 * PiRepeatRectangularDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiRepeatRectangularDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRepeatRectangularDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'repeat-rectangular icon',
  ...props
}: PiRepeatRectangularDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.18 5H11c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 7.73c-.476.934-.536 2.12-.544 4.27m2.819 7H13c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185c.476-.934.536-2.12.544-4.27" opacity=".28"/><path fill={color || "currentColor"} d="M18.588 1.191a1 1 0 0 0-1.583.909l.061.611a23 23 0 0 1 0 4.578l-.061.612a1 1 0 0 0 1.583.908A16.3 16.3 0 0 0 21.7 5.85a1.355 1.355 0 0 0 0-1.7 16.3 16.3 0 0 0-3.112-2.959Z"/><path fill={color || "currentColor"} d="M6.995 16.1a1 1 0 0 0-1.583-.909A16.3 16.3 0 0 0 2.3 18.15a1.355 1.355 0 0 0 0 1.7 16.3 16.3 0 0 0 3.112 2.959 1 1 0 0 0 1.583-.909l-.061-.611a23 23 0 0 1 0-4.578z"/>
    </svg>
  );
}
