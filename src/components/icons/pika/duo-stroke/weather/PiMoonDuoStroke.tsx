import React from 'react';

/**
 * PiMoonDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiMoonDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMoonDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'moon icon',
  ...props
}: PiMoonDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 14a6 6 0 0 0 4.977-2.648Q21 11.673 21 12a9 9 0 1 1-8.352-8.977A6 6 0 0 0 16 14Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.977 11.352a6 6 0 1 1-8.329-8.33" fill="none"/>
    </svg>
  );
}
