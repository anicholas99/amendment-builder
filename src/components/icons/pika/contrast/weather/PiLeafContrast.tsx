import React from 'react';

/**
 * PiLeafContrast icon from the contrast style in weather category.
 */
interface PiLeafContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLeafContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'leaf icon',
  ...props
}: PiLeafContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M5.34 18.212C.34 2.712 15.5 7 19 3c3.082 11.5-1.16 19.712-13.66 15.212Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10.5s-8 3.5-8 10" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.34 18.212C.34 2.712 15.5 7 19 3c3.082 11.5-1.16 19.712-13.66 15.212Z" fill="none"/>
    </svg>
  );
}
