import React from 'react';

/**
 * PiDivideDefaultDuoStroke icon from the duo-stroke style in maths category.
 */
interface PiDivideDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDivideDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'divide-default icon',
  ...props
}: PiDivideDefaultDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M13.002 17.002a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z" fill="none"/><path d="M13.002 6.999a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" fill="none"/>
    </svg>
  );
}
